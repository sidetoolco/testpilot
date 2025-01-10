/*
  # Create Test Tables
  
  1. Creates tests table for storing test configurations
  2. Creates test_sessions table for storing test results
  3. Adds necessary foreign keys and constraints
  4. Enables RLS
*/

-- Create tests table
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  search_term TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create test sessions table
CREATE TABLE IF NOT EXISTS public.test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES public.tests(id) NOT NULL,
  tester_name TEXT NOT NULL,
  tester_age INTEGER CHECK (tester_age > 0),
  tester_gender TEXT,
  tester_country TEXT,
  device TEXT,
  duration TEXT,
  comments INTEGER DEFAULT 0,
  outcome TEXT CHECK (outcome IN ('selected_our_product', 'selected_competitor')),
  selected_product_id UUID REFERENCES public.products(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS tests_company_id_idx ON public.tests(company_id);
CREATE INDEX IF NOT EXISTS test_sessions_test_id_idx ON public.test_sessions(test_id);