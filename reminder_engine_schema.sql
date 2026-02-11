-- Reminder Engine Schema Changes

-- 1. Reminder Templates
CREATE TABLE IF NOT EXISTS public.reminder_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('email', 'sms', 'whatsapp')) DEFAULT 'whatsapp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reminder_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own templates." ON public.reminder_templates;
CREATE POLICY "Users can manage their own templates." ON public.reminder_templates
    FOR ALL USING (auth.uid() = user_id);

-- 2. Reminder Schedules
CREATE TABLE IF NOT EXISTS public.reminder_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_id UUID REFERENCES public.loans NOT NULL,
    type TEXT CHECK (type IN ('before_due', 'on_due', 'after_due')) NOT NULL,
    days_offset INTEGER NOT NULL,
    channel TEXT CHECK (channel IN ('email', 'sms', 'whatsapp')) DEFAULT 'whatsapp',
    is_enabled BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reminder_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lenders can manage reminder schedules for their loans." ON public.reminder_schedules;
CREATE POLICY "Lenders can manage reminder schedules for their loans." ON public.reminder_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = reminder_schedules.loan_id
            AND loans.lender_id = auth.uid()
        )
    );

-- 3. Update reminders log table (if needed, but it already has status and message)
-- We can add a 'scheduled_at' column to track when it was intended to be sent
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'scheduled_at') THEN
        ALTER TABLE public.reminders ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
