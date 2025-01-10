/*
  # Add Company Management Policies
  
  Adds policies for company management and updates handle_new_user function:
  1. Adds policies for company creation and deletion
  2. Updates handle_new_user to properly handle company_name from metadata
  3. Ensures proper error handling in company creation
*/

-- Add policies for company management
DO $$ BEGIN
  DROP POLICY IF EXISTS "Company owners can create companies" ON public.companies;
  DROP POLICY IF EXISTS "Company owners can delete their company" ON public.companies;
END $$;

CREATE POLICY "Company owners can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (true);

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

-- Update handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  company_id UUID;
  company_name TEXT;
BEGIN
  -- Get company name from metadata with proper fallbacks
  company_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'full_name' || '''s Company',
    SPLIT_PART(NEW.email, '@', 1) || '''s Company'
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
      company_name,
      LOWER(REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
      NOW(),
      NOW()
    )
    RETURNING id INTO company_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating company: %', SQLERRM;
    -- Continue execution to at least create/update the profile
  END;

  -- Update profile if company was created successfully
  IF company_id IS NOT NULL THEN
    UPDATE public.profiles SET
      company_id = company_id,
      role = 'owner',
      waiting_list = FALSE,
      company_joined_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;