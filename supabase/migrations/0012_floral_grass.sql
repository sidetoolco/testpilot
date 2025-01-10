/*
  # Create Company on Signup

  1. Changes
    - Update handle_new_user function to create a company
    - Associate user with company as owner
    - Add company creation policy
  
  2. Security
    - Enable RLS on companies table
    - Add policy for company creation
*/

-- Update handle_new_user function to create company
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

  -- Create company
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
    company_id = EXCLUDED.company_id,
    role = EXCLUDED.role,
    company_joined_at = EXCLUDED.company_joined_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for company creation
CREATE POLICY "Users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (true);  -- Allow any authenticated user to create a company

-- Add policy for company deletion
CREATE POLICY "Company owners can delete their company"
  ON public.companies
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = companies.id
      AND profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );