-- Create contacts table to store unique borrower information for lenders
create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null, -- The lender who "owns" this contact
  name text not null,
  borrower_id uuid references auth.users(id) on delete set null, -- Optional: link to a registered user
  tags text[] default '{}',
  last_loan_at timestamp with time zone,
  loan_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

-- Enable RLS
alter table public.contacts enable row level security;

-- Policies
create policy "Users can manage their own contacts"
  on public.contacts for all
  using (auth.uid() = user_id);

-- Indexing for performance
create index if not exists contacts_user_id_idx on public.contacts(user_id);
create index if not exists contacts_name_idx on public.contacts(name);
