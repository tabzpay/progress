-- Create documents table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  loan_id uuid references public.loans(id) on delete cascade not null,
  uploader_id uuid references auth.users(id) not null,
  file_path text not null,
  file_type text not null, -- 'application/pdf', 'image/jpeg', etc.
  file_size bigint not null,
  category text not null check (category in ('agreement', 'receipt', 'identity', 'other')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists documents_loan_id_idx on public.documents(loan_id);
create index if not exists documents_uploader_id_idx on public.documents(uploader_id);

-- RLS Policies for documents table
alter table public.documents enable row level security;

-- Policy: Users can view documents for loans they are involved in (lender or borrower)
create policy "Users can view documents for their loans"
  on public.documents for select
  using (
    exists (
      select 1 from public.loans
      where loans.id = documents.loan_id
      and (loans.lender_id = auth.uid() or loans.borrower_id = auth.uid())
    )
  );

-- Policy: Users can insert documents for loans they are involved in
create policy "Users can upload documents to their loans"
  on public.documents for insert
  with check (
    auth.uid() = uploader_id
    and exists (
      select 1 from public.loans
      where loans.id = loan_id
      and (loans.lender_id = auth.uid() or loans.borrower_id = auth.uid())
    )
  );

-- Policy: Users can delete their own uploads
create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = uploader_id);

-- Storage Policies (assuming 'loan-documents' bucket exists)
-- Note: You may need to create the bucket manually in Supabase dashboard 
-- or via: insert into storage.buckets (id, name, public) values ('loan-documents', 'loan-documents', false);

-- Policy: Allow users to download/view files if they are the Lender or Borrower of the loan (folder name)
create policy "Access to loan documents via folder structure"
on storage.objects for select
to authenticated
using (
  bucket_id = 'loan-documents'
  and exists (
    select 1 from public.loans
    where loans.id::text = split_part(name, '/', 1)
    and (loans.lender_id = auth.uid() or loans.borrower_id = auth.uid())
  )
);

-- Policy: Allow users to upload files if they are the Lender or Borrower of the loan (folder name)
create policy "Upload to loan documents via folder structure"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'loan-documents'
  and exists (
    select 1 from public.loans
    where loans.id::text = split_part(name, '/', 1)
    and (loans.lender_id = auth.uid() or loans.borrower_id = auth.uid())
  )
);

-- Policy: Allow users to delete their own uploaded files
create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'loan-documents'
  and owner = auth.uid()
);
