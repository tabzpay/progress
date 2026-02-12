-- Add expanded profile columns
alter table public.profiles add column if not exists onboarding_intent text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists occupation text;
alter table public.profiles add column if not exists currency text default 'USD';
alter table public.profiles add column if not exists timezone text;
alter table public.profiles add column if not exists preferred_channel text default 'whatsapp';
alter table public.profiles add column if not exists attribution text;

-- Update handle_new_user function to sync all metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create Profile
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
    attribution
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
    new.raw_user_meta_data->>'attribution'
  );
  
  -- Create Default Free Subscription
  insert into public.subscriptions (user_id, status, plan_id)
  values (new.id, 'active', 'starter');
  
  return new;
end;
$$ language plpgsql security definer;
