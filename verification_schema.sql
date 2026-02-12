-- Add verification columns to profiles table
-- This migration adds columns to track email and phone verification status

-- First, ensure all required profile columns exist (from expanded onboarding)
alter table public.profiles add column if not exists onboarding_intent text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists occupation text;
alter table public.profiles add column if not exists currency text default 'USD';
alter table public.profiles add column if not exists timezone text;
alter table public.profiles add column if not exists preferred_channel text default 'whatsapp';
alter table public.profiles add column if not exists attribution text;

-- Add email verification timestamp (synced from auth.users)
alter table public.profiles add column if not exists email_verified_at timestamp with time zone;

-- Add phone verification flag
alter table public.profiles add column if not exists phone_verified boolean default false;

-- Add overall verification status flag
alter table public.profiles add column if not exists is_verified boolean default false;

-- Update is_verified for existing users based on email_verified_at and phone_verified
-- This will set is_verified to true only when BOTH email is verified AND phone is verified
update public.profiles
set is_verified = (email_verified_at is not null and phone_verified = true)
where is_verified != (email_verified_at is not null and phone_verified = true);

-- Create a function to automatically update is_verified status
create or replace function public.update_verification_status()
returns trigger as $$
begin
  -- Set is_verified to true only when both email and phone are verified
  new.is_verified := (new.email_verified_at is not null and new.phone_verified = true);
  return new;
end;
$$ language plpgsql;

-- Drop trigger if it exists
drop trigger if exists on_profile_verification_change on public.profiles;

-- Create trigger to automatically update is_verified when email or phone verification changes
create trigger on_profile_verification_change
  before insert or update of email_verified_at, phone_verified
  on public.profiles
  for each row
  execute function public.update_verification_status();

-- Update the handle_new_user function to sync email_verified_at from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create Profile with verification status
  insert into public.profiles (
    id, 
    full_name, 
    avatar_url, 
    email, 
    onboarding_intent, 
    phone,
    occupation,
    currency,
    timezone,
    preferred_channel,
    attribution,
    email_verified_at,
    phone_verified,
    is_verified
  )
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.email,
    new.raw_user_meta_data->>'intent',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'occupation',
    coalesce(new.raw_user_meta_data->>'currency', 'USD'),
    new.raw_user_meta_data->>'timezone',
    coalesce(new.raw_user_meta_data->>'preferred_channel', 'whatsapp'),
    new.raw_user_meta_data->>'attribution',
    new.email_confirmed_at,  -- Sync email verification from auth
    case when new.raw_user_meta_data->>'phone' is not null then false else false end,  -- Phone not verified by default
    false  -- Not verified by default
  );
  
  -- Create Default Free Subscription
  insert into public.subscriptions (user_id, status, plan_id)
  values (new.id, 'active', 'starter');
  
  return new;
end;
$$ language plpgsql security definer;

-- Create a helper function to sync email verification status from auth.users
create or replace function public.sync_email_verification()
returns void as $$
begin
  update public.profiles p
  set email_verified_at = u.email_confirmed_at
  from auth.users u
  where p.id = u.id
  and p.email_verified_at is distinct from u.email_confirmed_at;
end;
$$ language plpgsql security definer;

-- Comments for documentation
comment on column public.profiles.email_verified_at is 'Timestamp when email was confirmed, synced from auth.users.email_confirmed_at';
comment on column public.profiles.phone_verified is 'Boolean indicating if phone number has been verified via OTP or other means';
comment on column public.profiles.is_verified is 'Computed field: true when BOTH email_verified_at is not null AND phone_verified is true';
