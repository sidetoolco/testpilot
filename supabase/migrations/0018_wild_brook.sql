/*
  # Setup email confirmation

  1. Changes
    - Add email_confirmed column to profiles
    - Update handle_new_user function to handle email confirmation
  
  2. Security
    - No changes to existing policies
*/

-- Add email_confirmed column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN NOT NULL DEFAULT FALSE;

-- Update handle_new_user function to handle email confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  company_id UUID;
  company_name TEXT;
BEGIN
  -- Get company name from metadata
  company_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'full_name' || '''s Company',
    SPLIT_PART(NEW.email, '@', 1) || '''s Company'
  );

  -- Create company with waiting list set to TRUE
  INSERT INTO public.companies (
    name,
    slug,
    waiting_list,
    created_at,
    updated_at
  )
  VALUES (
    company_name,
    LOWER(REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
    TRUE,
    NOW(),
    NOW()
  )
  RETURNING id INTO company_id;

  -- Create profile with company association
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    company_id,
    role,
    company_joined_at,
    email_confirmed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    company_id,
    'owner',
    NOW(),
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_id = EXCLUDED.company_id,
    role = EXCLUDED.role,
    company_joined_at = EXCLUDED.company_joined_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;