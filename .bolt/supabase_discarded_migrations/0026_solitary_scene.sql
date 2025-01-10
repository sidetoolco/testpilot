/*
  # Create Insights Table
  
  1. Creates insights table for storing test insights and analysis
  2. Adds necessary columns and constraints
  3. Creates indexes for performance
*/

-- Create insights table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES public.tests(id) NOT NULL,
  session_id UUID REFERENCES public.test_sessions(id),
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS insights_test_id_idx ON public.insights(test_id);
CREATE INDEX IF NOT EXISTS insights_session_id_idx ON public.insights(session_id);
CREATE INDEX IF NOT EXISTS insights_type_idx ON public.insights(type);