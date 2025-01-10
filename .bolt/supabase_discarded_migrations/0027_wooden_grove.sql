/*
  # Create Tests Table
  
  1. Creates tests table for storing test configurations
  2. Adds necessary columns and constraints
  3. Creates indexes for performance
*/

-- Create tests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create indexes
CREATE INDEX IF NOT EXISTS tests_company_id_idx ON public.tests(company_id);
CREATE INDEX IF NOT EXISTS tests_user_id_idx ON public.tests(user_id);
CREATE INDEX IF NOT EXISTS tests_status_idx ON public.tests(status);
CREATE INDEX IF NOT EXISTS tests_company_status_idx ON public.tests(company_id, status);