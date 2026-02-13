-- Add Business Lending Fields to Loans Table
-- Extends the loans table with customer management and tax handling

-- =====================================================
-- ADD CUSTOMER REFERENCE
-- =====================================================
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'loans' and column_name = 'customer_id'
  ) then
    alter table public.loans add column customer_id uuid references public.customers;
    create index idx_loans_customer_id on public.loans(customer_id);
  end if;
end $$;

-- =====================================================
-- ADD PAYMENT TERMS
-- =====================================================
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'loans' and column_name = 'payment_terms'
  ) then
    alter table public.loans add column payment_terms text;
  end if;
end $$;

-- =====================================================
-- ADD TAX FIELDS
-- =====================================================
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'loans' and column_name = 'tax_rate'
  ) then
    alter table public.loans add column tax_rate numeric default 0;
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'loans' and column_name = 'tax_amount'
  ) then
    alter table public.loans add column tax_amount numeric default 0;
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'loans' and column_name = 'subtotal'
  ) then
    alter table public.loans add column subtotal numeric;
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'loans' and column_name = 'discount_amount'
  ) then
    alter table public.loans add column discount_amount numeric default 0;
  end if;
end $$;

-- =====================================================
-- AUTOMATIC TAX CALCULATION TRIGGER
-- =====================================================
create or replace function calculate_loan_total()
returns trigger as $$
begin
  -- If subtotal is set, use it for calculations; otherwise use amount
  if new.subtotal is not null then
    new.tax_amount := new.subtotal * (coalesce(new.tax_rate, 0) / 100);
    new.amount := new.subtotal + new.tax_amount - coalesce(new.discount_amount, 0);
  elsif new.tax_rate is not null and new.tax_rate > 0 then
    -- If only amount and tax_rate are set, calculate backwards
    new.tax_amount := new.amount * (new.tax_rate / 100);
  end if;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists calculate_loan_total_trigger on public.loans;
create trigger calculate_loan_total_trigger
  before insert or update of subtotal, tax_rate, discount_amount
  on public.loans
  for each row
  execute function calculate_loan_total();

-- =====================================================
-- UPDATE CUSTOMER BALANCE TRIGGER
-- =====================================================
-- Automatically update customer balances when loan is created/updated/deleted
create or replace function sync_customer_balance_on_loan_change()
returns trigger as $$
begin
  -- On INSERT or UPDATE with customer_id
  if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') and new.customer_id is not null then
    perform update_customer_balances(new.customer_id);
  end if;
  
  -- On UPDATE when customer_id changed, update both old and new customer
  if TG_OP = 'UPDATE' and old.customer_id is distinct from new.customer_id then
    if old.customer_id is not null then
      perform update_customer_balances(old.customer_id);
    end if;
  end if;
  
  -- On DELETE
  if TG_OP = 'DELETE' and old.customer_id is not null then
    perform update_customer_balances(old.customer_id);
    return old;
  end if;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists sync_customer_balance_trigger on public.loans;
create trigger sync_customer_balance_trigger
  after insert or update or delete
  on public.loans
  for each row
  execute function sync_customer_balance_on_loan_change();

-- =====================================================
-- UPDATE CUSTOMER BALANCE ON REPAYMENT
-- =====================================================
create or replace function sync_customer_balance_on_repayment()
returns trigger as $$
declare
  loan_customer_id uuid;
begin
  -- Get customer_id from the loan
  select customer_id into loan_customer_id
  from public.loans
  where id = coalesce(new.loan_id, old.loan_id);
  
  -- Update customer balance if loan has a customer
  if loan_customer_id is not null then
    perform update_customer_balances(loan_customer_id);
  end if;
  
  if TG_OP = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql;

drop trigger if exists sync_customer_balance_on_repayment_trigger on public.repayments;
create trigger sync_customer_balance_on_repayment_trigger
  after insert or update or delete
  on public.repayments
  for each row
  execute function sync_customer_balance_on_repayment();

-- =====================================================
-- HELPER FUNCTION: Calculate Due Date from Payment Terms
-- =====================================================
create or replace function calculate_due_date_from_terms(
  start_date timestamp with time zone,
  terms text
)
returns timestamp with time zone as $$
begin
  case terms
    when 'Net 7' then
      return start_date + interval '7 days';
    when 'Net 15' then
      return start_date + interval '15 days';
    when 'Net 30' then
      return start_date + interval '30 days';
    when 'Net 60' then
      return start_date + interval '60 days';
    when 'Net 90' then
      return start_date + interval '90 days';
    when 'Due on Receipt' then
      return start_date;
    else
      -- Default to Net 30 if unknown term
      return start_date + interval '30 days';
  end case;
end;
$$ language plpgsql immutable;
