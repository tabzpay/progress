-- Create activity_log table for audit trail
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- e.g., 'LOGIN', 'LOAN_CREATED', 'PAYMENT_RECORDED', 'MFA_ENABLED', 'MFA_DISABLED', 'ENCRYPTION_UNLOCKED'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own logs
CREATE POLICY "Users can view their own activity logs"
    ON public.activity_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: System/Trigger can insert logs (or users can insert their own if we log from client)
CREATE POLICY "Users can insert their own activity logs"
    ON public.activity_log
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
