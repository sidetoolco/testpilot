/*
  # Create tests table and policies

  1. New Tables
    - Creates tests table with required columns
    - Adds necessary constraints and defaults
  2. Security
    - Enables RLS
    - Adds policies for company-based access
  3. Indexes
    - Creates indexes for performance optimization
*/

-- Create tests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  search_term TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS tests_company_id_idx ON public.tests(company_id);
CREATE INDEX IF NOT EXISTS tests_user_id_idx ON public.tests(user_id);