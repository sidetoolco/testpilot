-- Drop company_members table since we're using profiles
DROP TABLE IF EXISTS public.company_members CASCADE;

-- Update handle_new_user function to use company_name from metadata
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

  -- Create company
  INSERT INTO public.companies (
    name,
    slug,
    created_at,
    updated_at
  )
  VALUES (
    company_name,
    LOWER(REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
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
    'owner',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    waiting_list = FALSE,
    company_id = EXCLUDED.company_id,
    role = EXCLUDED.role,
    company_joined_at = EXCLUDED.company_joined_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;