/*
  # Fix Waiting List and Company Creation

  1. Changes
    - Add NOT NULL constraint for waiting_list
    - Set default value for waiting_list
    - Improve handle_new_user function with better error handling
    
  2. Security
    - Maintains existing security policies
    - Improves error handling in trigger function
*/

-- Add NOT NULL constraint and set default
ALTER TABLE public.profiles 
  ALTER COLUMN waiting_list SET NOT NULL,
  ALTER COLUMN waiting_list SET DEFAULT FALSE;

-- Update existing records
UPDATE public.profiles 
SET waiting_list = FALSE 
WHERE waiting_list IS NULL;

-- Improve handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  company_id UUID;
  user_name TEXT;
BEGIN
  -- Get user's name or email prefix for company name
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Create company with error handling
  BEGIN
    INSERT INTO public.companies (
      name,
      slug,
      created_at,
      updated_at
    )
    VALUES (
      user_name || '''s Company',
      LOWER(REGEXP_REPLACE(user_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
      NOW(),
      NOW()
    )
    RETURNING id INTO company_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating company: %', SQLERRM;
    -- Continue execution to at least create the profile
  END;

  -- Create or update profile with company association
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    waiting_list,
    company_id,
    role,
    company_joined_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE,
    company_id,
    CASE WHEN company_id IS NOT NULL THEN 'owner' ELSE NULL END,
    CASE WHEN company_id IS NOT NULL THEN NOW() ELSE NULL END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    waiting_list = FALSE,
    company_id = COALESCE(EXCLUDED.company_id, profiles.company_id),
    role = COALESCE(EXCLUDED.role, profiles.role),
    company_joined_at = COALESCE(EXCLUDED.company_joined_at, profiles.company_joined_at),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error and re-raise
  RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;