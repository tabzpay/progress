-- Update loans table with payment plan fields
alter table public.loans 
add column if not exists repayment_schedule text check (repayment_schedule in ('one_time', 'installments')) default 'one_time',
add column if not exists installment_frequency text check (installment_frequency in ('weekly', 'bi_weekly', 'monthly')),
add column if not exists interest_rate numeric(5,2) default 0,
add column if not exists interest_type text check (interest_type in ('simple', 'compound')) default 'simple',
add column if not exists late_fee_amount numeric default 0,
add column if not exists grace_period_days integer default 0;

-- Create installments table
create table if not exists public.installments (
  id uuid default gen_random_uuid() primary key,
  loan_id uuid references public.loans(id) on delete cascade not null,
  installment_number integer not null,
  due_date timestamp with time zone not null,
  amount_due numeric not null,
  amount_paid numeric default 0,
  status text check (status in ('pending', 'paid', 'partially_paid', 'overdue')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for installments
create index if not exists installments_loan_id_idx on public.installments(loan_id);
create index if not exists installments_status_idx on public.installments(status);
create index if not exists installments_due_date_idx on public.installments(due_date);

-- RLS Policies for installments
alter table public.installments enable row level security;

-- Policy: Users can view installments for their loans
create policy "Users can view installments for their loans"
  on public.installments for select
  using (
    exists (
      select 1 from public.loans
      where loans.id = installments.loan_id
      and (loans.lender_id = auth.uid() or loans.borrower_id = auth.uid())
    )
  );

-- Policy: Lenders can manage installments (create/update)
-- In a real app, creation might be server-side only, but for this app allowing lender creation is fine
create policy "Lenders can manage installments"
  on public.installments for all
  using (
    exists (
      select 1 from public.loans
      where loans.id = installments.loan_id
      and loans.lender_id = auth.uid()
    )
  );
