-- ==========================================
-- LOAN TEMPLATES SYSTEM
-- Run this in Supabase SQL Editor after database_indexes.sql
-- ==========================================

-- Create loan templates table
CREATE TABLE IF NOT EXISTS public.loan_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('personal', 'business', 'group')),
  currency TEXT DEFAULT 'USD',
  default_amount NUMERIC,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.loan_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.loan_templates;
CREATE POLICY "Users can view their own templates"
  ON public.loan_templates
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own templates" ON public.loan_templates;
CREATE POLICY "Users can create their own templates"
  ON public.loan_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.loan_templates;
CREATE POLICY "Users can update their own templates"
  ON public.loan_templates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.loan_templates;
CREATE POLICY "Users can delete their own templates"
  ON public.loan_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster template lookups
CREATE INDEX IF NOT EXISTS idx_loan_templates_user_id 
  ON public.loan_templates(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_loan_templates_updated_at ON public.loan_templates;
CREATE TRIGGER update_loan_templates_updated_at
    BEFORE UPDATE ON public.loan_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'loan_templates'
  AND table_schema = 'public'
ORDER BY ordinal_position;
