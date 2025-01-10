-- Add waiting_list column to companies table
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS waiting_list BOOLEAN NOT NULL DEFAULT FALSE;

-- Remove waiting_list column from profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS waiting_list;

-- Update handle_new_user function to handle waiting list at company level
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

  -- Create company with waiting list
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
    FALSE, -- Set default waiting list status
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

-- Create function to manage company waiting list status
CREATE OR REPLACE FUNCTION public.manage_company_waiting_list(company_id UUID, status BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE public.companies
  SET 
    waiting_list = status,
    updated_at = NOW()
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for managing waiting list
CREATE POLICY "Company owners can manage waiting list"
  ON public.companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = companies.id
      AND profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );