/*
  # Update company waiting list default

  1. Changes
    - Update company waiting list default to TRUE
    - Update handle_new_user function to set waiting_list to TRUE for new companies
  
  2. Security
    - No changes to existing policies
*/

-- Update handle_new_user function to set waiting_list to TRUE by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  company_id UUID;
  company_name TEXT;
BEGIN
  -- Get company name from metadata or fallback to user name
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
    TRUE, -- Set waiting list to TRUE by default
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

-- Update existing companies to have waiting_list TRUE if NULL
UPDATE public.companies 
SET waiting_list = TRUE 
WHERE waiting_list IS NULL;