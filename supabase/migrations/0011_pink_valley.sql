/*
  # Update Company and Profile Relationships

  1. Changes
    - Add company-related columns to profiles if not exists
    - Update policies to use profiles table
    - Add performance indexes
    
  2. Security
    - Maintains existing access control
    - Updates policies to use profiles table
*/

-- Add company-related columns to profiles if not exists
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
    ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('owner', 'admin', 'member')),
    ADD COLUMN IF NOT EXISTS company_joined_at TIMESTAMPTZ DEFAULT now();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Recreate company policies using profiles
DROP POLICY IF EXISTS "Users can view companies they are members of" ON public.companies;
CREATE POLICY "Users can view companies they are members of"
  ON public.companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = companies.id
      AND profiles.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Company owners and admins can update company" ON public.companies;
CREATE POLICY "Company owners and admins can update company"
  ON public.companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = companies.id
      AND profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- Update product policies
DROP POLICY IF EXISTS "Users can view company products" ON public.products;
CREATE POLICY "Users can view company products"
  ON public.products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = products.company_id
      AND profiles.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage company products" ON public.products;
CREATE POLICY "Users can manage company products"
  ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = products.company_id
      AND profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin', 'member')
    )
  );

-- Update test policies
DROP POLICY IF EXISTS "Users can view company tests" ON public.tests;
CREATE POLICY "Users can view company tests"
  ON public.tests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = tests.company_id
      AND profiles.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage company tests" ON public.tests;
CREATE POLICY "Users can manage company tests"
  ON public.tests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = tests.company_id
      AND profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin', 'member')
    )
  );

-- Add indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);