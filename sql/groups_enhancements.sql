-- Enhanced Groups Schema
-- Adds additional fields for richer group management

-- Add new columns to groups table
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS group_type VARCHAR(50) DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS privacy_level VARCHAR(20) DEFAULT 'private',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add check constraints for valid values
ALTER TABLE public.groups
DROP CONSTRAINT IF EXISTS groups_group_type_check;

ALTER TABLE public.groups
ADD CONSTRAINT groups_group_type_check 
CHECK (group_type IN ('personal', 'business', 'investment', 'community', 'other'));

ALTER TABLE public.groups
DROP CONSTRAINT IF EXISTS groups_privacy_level_check;

ALTER TABLE public.groups
ADD CONSTRAINT groups_privacy_level_check 
CHECK (privacy_level IN ('public', 'private', 'invite_only'));

ALTER TABLE public.groups
DROP CONSTRAINT IF EXISTS groups_currency_check;

ALTER TABLE public.groups
ADD CONSTRAINT groups_currency_check 
CHECK (default_currency IN ('USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES', 'ZAR', 'JPY', 'CNY'));

-- Add index for performance on deleted_at queries
CREATE INDEX IF NOT EXISTS idx_groups_deleted_at ON public.groups(deleted_at) WHERE deleted_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.groups.description IS 'Optional description of the group purpose';
COMMENT ON COLUMN public.groups.avatar_url IS 'URL to group avatar/icon image';
COMMENT ON COLUMN public.groups.default_currency IS 'Default currency for group transactions';
COMMENT ON COLUMN public.groups.group_type IS 'Type of group: personal, business, investment, community, other';
COMMENT ON COLUMN public.groups.privacy_level IS 'Privacy level: public, private, invite_only';
COMMENT ON COLUMN public.groups.deleted_at IS 'Timestamp when group was soft-deleted (NULL = active)';
