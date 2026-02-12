-- ==========================================
-- RLS FIX SCRIPT
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- ==========================================

-- 1. DROP EXISTING POLICIES & FUNCTIONS TO CLEAN SLATE

-- Drop policies on 'groups'
drop policy if exists "Users can view groups they are members of." on public.groups;
drop policy if exists "Users can create groups." on public.groups;

-- Drop policies on 'group_members'
drop policy if exists "Users can view members of their groups." on public.group_members;
drop policy if exists "Admins can add members." on public.group_members;

-- Drop existing functions to redefine them
drop function if exists public.is_group_member(uuid);
drop function if exists public.is_group_admin(uuid);

-- 2. CREATE HELPER FUNCTIONS WITH SECURITY DEFINER
-- 'security definer' means these functions run with the privileges of the CREATOR (you/postgres),
-- effectively bypassing RLS tables when called.
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

-- 3. RECREATE POLICIES USING THE HELPER FUNCTIONS

-- GROUPS Table Policies
create policy "Users can view groups they are members of." on public.groups
  for select using (
    public.is_group_member(id)
  );

create policy "Users can create groups." on public.groups
  for insert with check (auth.uid() = created_by);

-- GROUP MEMBERS Table Policies
create policy "Users can view members of their groups." on public.group_members
  for select using (
    auth.uid() = user_id -- Users can always see themselves
    or
    public.is_group_member(group_id) -- Users can see other members of groups they belong to
  );

create policy "Admins can add members." on public.group_members
  for insert with check (
    public.is_group_admin(group_id) -- Must be admin of that group
    or
    -- Or be the creator of the group (implicitly admin)
    exists (
       select 1 from public.groups
       where groups.id = group_members.group_id
       and groups.created_by = auth.uid()
    )
  );

-- 4. UPDATE LOANS POLICIES (Break RLS Chain)
drop policy if exists "Users can view loans where they are lender or borrower." on public.loans;

create policy "Users can view loans where they are lender or borrower." on public.loans
  for select using (
    auth.uid() = lender_id 
    or auth.uid() = borrower_id
    or (
      group_id is not null and public.is_group_member(group_id)
    )
  );

-- 5. UPDATE REPAYMENTS POLICIES (Break RLS Chain)
drop policy if exists "Users can view repayments for their loans." on public.repayments;

create policy "Users can view repayments for their loans." on public.repayments
  for select using (
    exists (
      select 1 from public.loans
      where loans.id = repayments.loan_id
      and (
        loans.lender_id = auth.uid() 
        or loans.borrower_id = auth.uid()
        or (
          loans.group_id is not null and public.is_group_member(loans.group_id)
        )
      )
    )
  );
