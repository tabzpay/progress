
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

alter table public.profiles enable row level security;

-- Drop existing policies to avoid "already exists" errors
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 2. GROUPS (Moved up to be referenced by Loans)
create table if not exists public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.groups enable row level security;

drop policy if exists "Users can view groups they are members of." on public.groups;
drop policy if exists "Users can create groups." on public.groups;

create policy "Users can view groups they are members of." on public.groups
  for select using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Users can create groups." on public.groups
  for insert with check (auth.uid() = created_by);

-- 3. GROUP MEMBERS (Moved up)
create table if not exists public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups not null,
  user_id uuid references auth.users not null,
  role text default 'member',
  balance numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

alter table public.group_members enable row level security;

drop policy if exists "Users can view members of their groups." on public.group_members;
drop policy if exists "Admins can add members." on public.group_members;

-- Helper functions to avoid infinite recursion
create or replace function public.is_group_member(group_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.group_members
    where group_id = group_uuid
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_group_admin(group_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.group_members
    where group_id = group_uuid
    and user_id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

create policy "Users can view members of their groups." on public.group_members
  for select using (
    auth.uid() = user_id -- Can always see self
    or
    public.is_group_member(group_id) -- Can see others if in same group
  );

create policy "Admins can add members." on public.group_members
  for insert with check (
    public.is_group_admin(group_id)
    or
    exists (
       select 1 from public.groups
       where groups.id = group_members.group_id
       and groups.created_by = auth.uid()
    )
  );

-- 4. LOANS (Now with Group ID)
create table if not exists public.loans (
  id uuid default uuid_generate_v4() primary key,
  lender_id uuid references auth.users not null,
  borrower_id uuid references auth.users,
  amount numeric not null,
  currency text not null default 'USD',
  status text not null default 'PENDING',
  borrower_name text not null,
  description text,
  due_date timestamp with time zone,
  type text check (type in ('personal', 'business', 'group')),
  bank_details jsonb,
  group_id uuid references public.groups, -- NEW COLUMN
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MIGRATION: Add group_id if it doesn't exist (for existing tables)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'loans' and column_name = 'group_id') then
    alter table public.loans add column group_id uuid references public.groups;
  end if;
end $$;

alter table public.loans enable row level security;

drop policy if exists "Users can view loans where they are lender or borrower." on public.loans;
drop policy if exists "Users can create loans as lender." on public.loans;
drop policy if exists "Lenders can update their loans." on public.loans;

-- UPDATED POLICY: Allow group members to see loans in their group
create policy "Users can view loans where they are lender or borrower." on public.loans
  for select using (
    auth.uid() = lender_id 
    or auth.uid() = borrower_id
    or (
      group_id is not null and exists (
        select 1 from public.group_members
        where group_members.group_id = loans.group_id
        and group_members.user_id = auth.uid()
      )
    )
  );

create policy "Users can create loans as lender." on public.loans
  for insert with check (auth.uid() = lender_id);

create policy "Lenders can update their loans." on public.loans
  for update using (auth.uid() = lender_id);

-- 5. REPAYMENTS
create table if not exists public.repayments (
  id uuid default uuid_generate_v4() primary key,
  loan_id uuid references public.loans not null,
  payer_id uuid references auth.users,
  amount numeric not null,
  note text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.repayments enable row level security;

drop policy if exists "Users can view repayments for their loans." on public.repayments;
drop policy if exists "Lenders can log repayments." on public.repayments;

create policy "Users can view repayments for their loans." on public.repayments
  for select using (
    exists (
      select 1 from public.loans
      where loans.id = repayments.loan_id
      and (
        loans.lender_id = auth.uid() 
        or loans.borrower_id = auth.uid()
        or (
          loans.group_id is not null and exists (
            select 1 from public.group_members
            where group_members.group_id = loans.group_id
            and group_members.user_id = auth.uid()
          )
        )
      )
    )
  );

create policy "Lenders can log repayments." on public.repayments
  for insert with check (
    exists (
      select 1 from public.loans
      where loans.id = repayments.loan_id
      and loans.lender_id = auth.uid()
    )
  );

-- 6. REMINDERS
create table if not exists public.reminders (
  id uuid default uuid_generate_v4() primary key,
  loan_id uuid references public.loans not null,
  message text not null,
  channel text default 'whatsapp',
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reminders enable row level security;

drop policy if exists "Users can view reminders for their loans." on public.reminders;
drop policy if exists "Lenders can create reminders." on public.reminders;

create policy "Users can view reminders for their loans." on public.reminders
  for select using (
    exists (
      select 1 from public.loans
      where loans.id = reminders.loan_id
      and (loans.lender_id = auth.uid() or loans.borrower_id = auth.uid())
    )
  );

create policy "Lenders can create reminders." on public.reminders
  for insert with check (
    exists (
      select 1 from public.loans
      where loans.id = reminders.loan_id
      and loans.lender_id = auth.uid()
    )
  );

-- 7. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text default 'system',
  link_to text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications." on public.notifications;
drop policy if exists "Users can update their own notifications (mark read)." on public.notifications;
drop policy if exists "System can create notifications (or users trigger for others)." on public.notifications;

create policy "Users can view their own notifications." on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their own notifications (mark read)." on public.notifications
  for update using (auth.uid() = user_id);

create policy "System can create notifications (or users trigger for others)." on public.notifications
  for insert with check (true);

-- 8. SUBSCRIPTIONS (New for Monetization)
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  status text not null,
  plan_id text,
  current_period_end timestamp with time zone,
  customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view their own subscription." on public.subscriptions;
create policy "Users can view their own subscription." on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own subscription (for mock testing)." on public.subscriptions;
create policy "Users can update their own subscription (for mock testing)." on public.subscriptions
  for insert with check (auth.uid() = user_id);
  
drop policy if exists "Users can update their own subscription (update)." on public.subscriptions;
create policy "Users can update their own subscription (update)." on public.subscriptions
  for update using (auth.uid() = user_id);

-- 9. TRIGGERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create Profile
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  
  -- Create Default Free Subscription
  insert into public.subscriptions (user_id, status, plan_id)
  values (new.id, 'active', 'starter');
  
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger first to ensure idempotency
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper function to check subscription status easily
create or replace function public.check_subscription(user_uuid uuid)
returns text as $$
declare
  sub_status text;
begin
  select status into sub_status
  from public.subscriptions
  where user_id = user_uuid;
  
  return coalesce(sub_status, 'none');
end;
$$ language plpgsql security definer;
