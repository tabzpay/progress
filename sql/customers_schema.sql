-- Customer Management System Schema
-- For business lending with proper customer profiles and credit management

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null, -- Business owner
  
  -- Customer type
  customer_type text not null check (customer_type in ('individual', 'company')),
  
  -- Individual fields
  first_name text,
  last_name text,
  
  -- Company fields  
  company_name text,
  tax_id text, -- VAT/EIN/Tax Registration number
  registration_number text, -- Business registration number
  
  -- Contact information
  email text,
  phone text,
  address jsonb, -- {street, city, state, zip, country}
  
  -- Business terms
  credit_limit numeric default 0,
  payment_terms text default 'Net 30', -- Net 7, Net 15, Net 30, Net 60, Net 90, Due on Receipt
  currency text default 'USD',
  
  -- Financial tracking (auto-updated by triggers)
  total_credit_issued numeric default 0,
  outstanding_balance numeric default 0,
  
  -- Metadata
  notes text,
  tags text[], -- For categorization/filtering
  is_active boolean default true,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Validation: Ensure either individual or company fields are filled
  constraint valid_customer_data check (
    (customer_type = 'individual' and first_name is not null and last_name is not null)
    or
    (customer_type = 'company' and company_name is not null)
  )
);

-- =====================================================
-- CUSTOMER CONTACTS TABLE
-- =====================================================
-- Multiple contact persons per customer (especially for companies)
create table if not exists public.customer_contacts (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers on delete cascade not null,
  name text not null,
  role text, -- e.g., 'Accounts Payable', 'Purchasing Manager', 'CEO'
  email text,
  phone text,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- INDEXES
-- =====================================================
create index if not exists idx_customers_user_id on public.customers(user_id);
create index if not exists idx_customers_user_active on public.customers(user_id, is_active);
create index if not exists idx_customers_email on public.customers(email);
create index if not exists idx_customers_company_name on public.customers(company_name);
create index if not exists idx_customer_contacts_customer_id on public.customer_contacts(customer_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
alter table public.customers enable row level security;
alter table public.customer_contacts enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own customers" on public.customers;
drop policy if exists "Users can create their own customers" on public.customers;
drop policy if exists "Users can update their own customers" on public.customers;
drop policy if exists "Users can delete their own customers" on public.customers;

drop policy if exists "Users can view contacts for their customers" on public.customer_contacts;
drop policy if exists "Users can create contacts for their customers" on public.customer_contacts;
drop policy if exists "Users can update contacts for their customers" on public.customer_contacts;
drop policy if exists "Users can delete contacts for their customers" on public.customer_contacts;

-- Customers policies
create policy "Users can view their own customers" on public.customers
  for select using (auth.uid() = user_id);

create policy "Users can create their own customers" on public.customers
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own customers" on public.customers
  for update using (auth.uid() = user_id);

create policy "Users can delete their own customers" on public.customers
  for delete using (auth.uid() = user_id);

-- Customer contacts policies
create policy "Users can view contacts for their customers" on public.customer_contacts
  for select using (
    exists (
      select 1 from public.customers
      where customers.id = customer_contacts.customer_id
      and customers.user_id = auth.uid()
    )
  );

create policy "Users can create contacts for their customers" on public.customer_contacts
  for insert with check (
    exists (
      select 1 from public.customers
      where customers.id = customer_contacts.customer_id
      and customers.user_id = auth.uid()
    )
  );

create policy "Users can update contacts for their customers" on public.customer_contacts
  for update using (
    exists (
      select 1 from public.customers
      where customers.id = customer_contacts.customer_id
      and customers.user_id = auth.uid()
    )
  );

create policy "Users can delete contacts for their customers" on public.customer_contacts
  for delete using (
    exists (
      select 1 from public.customers
      where customers.id = customer_contacts.customer_id
      and customers.user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_customers_updated_at on public.customers;
create trigger update_customers_updated_at
  before update on public.customers
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate customer display name
create or replace function get_customer_name(customer_row public.customers)
returns text as $$
begin
  if customer_row.customer_type = 'company' then
    return customer_row.company_name;
  else
    return customer_row.first_name || ' ' || customer_row.last_name;
  end if;
end;
$$ language plpgsql immutable;

-- Check if loan amount exceeds customer credit limit
create or replace function check_customer_credit_limit(
  customer_uuid uuid,
  new_loan_amount numeric
)
returns jsonb as $$
declare
  customer_record public.customers;
  available_credit numeric;
begin
  select * into customer_record
  from public.customers
  where id = customer_uuid;
  
  if not found then
    return jsonb_build_object(
      'allowed', false,
      'message', 'Customer not found'
    );
  end if;
  
  available_credit := customer_record.credit_limit - customer_record.outstanding_balance;
  
  if new_loan_amount > available_credit then
    return jsonb_build_object(
      'allowed', false,
      'available_credit', available_credit,
      'over_limit_by', new_loan_amount - available_credit,
      'message', 'Loan amount exceeds available credit limit'
    );
  else
    return jsonb_build_object(
      'allowed', true,
      'available_credit', available_credit,
      'message', 'Credit check passed'
    );
  end if;
end;
$$ language plpgsql security definer;

-- Update customer balances (to be called when loan status changes)
create or replace function update_customer_balances(customer_uuid uuid)
returns void as $$
declare
  total_issued numeric;
  total_outstanding numeric;
begin
  -- Calculate total credit issued (all loans for this customer)
  select coalesce(sum(amount), 0) into total_issued
  from public.loans
  where customer_id = customer_uuid;
  
  -- Calculate outstanding balance (loans that are not fully paid)
  select coalesce(sum(amount - coalesce((
    select sum(r.amount)
    from public.repayments r
    where r.loan_id = loans.id
  ), 0)), 0) into total_outstanding
  from public.loans
  where customer_id = customer_uuid
  and status != 'PAID';
  
  -- Update customer record
  update public.customers
  set 
    total_credit_issued = total_issued,
    outstanding_balance = total_outstanding
  where id = customer_uuid;
end;
$$ language plpgsql security definer;
