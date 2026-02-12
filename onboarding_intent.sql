-- Add onboarding_intent and phone columns to profiles
alter table public.profiles add column if not exists onboarding_intent text;
alter table public.profiles add column if not exists phone text;

-- Update handle_new_user function to sync intent and phone
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create Profile
  insert into public.profiles (id, full_name, avatar_url, email, onboarding_intent, phone)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.email,
    new.raw_user_meta_data->>'intent',
    new.raw_user_meta_data->>'phone'
  );
  
  -- Create Default Free Subscription
  insert into public.subscriptions (user_id, status, plan_id)
  values (new.id, 'active', 'starter');
  
  return new;
end;
$$ language plpgsql security definer;
