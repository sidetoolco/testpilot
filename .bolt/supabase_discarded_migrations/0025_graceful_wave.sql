/*
  # Create Test Sessions Table
  
  1. Creates test_sessions table for storing test results
  2. Adds necessary columns and constraints
  3. Creates indexes for performance
*/

-- Create test_sessions table if it doesn't exist
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
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS test_sessions_test_id_idx ON public.test_sessions(test_id);
CREATE INDEX IF NOT EXISTS test_sessions_outcome_idx ON public.test_sessions(outcome);
CREATE INDEX IF NOT EXISTS test_sessions_selected_product_idx ON public.test_sessions(selected_product_id);