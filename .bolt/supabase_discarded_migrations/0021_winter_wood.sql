/*
  # Test Schema Update

  1. New Tables
    - test_sessions: Main test information and configuration
    - test_competitors: Links tests to competitor products
    - test_variations: Test variations (A/B/C)
    - test_demographics: Demographic targeting settings

  2. Security
    - Enable RLS on all tables
    - Add policies for company-based access control

  3. Changes
    - Add indexes for performance optimization
*/

-- Create test_sessions table first
CREATE TABLE IF NOT EXISTS public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  search_term TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on test_sessions
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for test_sessions
CREATE POLICY "Users can view company test sessions"
  ON public.test_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = test_sessions.company_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company test sessions"
  ON public.test_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = test_sessions.company_id
      AND profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin', 'member')
    )
  );

-- Create test_competitors table
CREATE TABLE IF NOT EXISTS public.test_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create test_variations table
CREATE TABLE IF NOT EXISTS public.test_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL,
  product_id UUID NOT NULL,
  variation_type TEXT NOT NULL CHECK (variation_type IN ('a', 'b', 'c')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(test_id, variation_type)
);

-- Create test_demographics table
CREATE TABLE IF NOT EXISTS public.test_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL,
  age_ranges TEXT[] NOT NULL,
  genders TEXT[] NOT NULL,
  locations TEXT[] NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  tester_count INTEGER NOT NULL CHECK (tester_count >= 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(test_id)
);

-- Enable RLS on other tables
ALTER TABLE public.test_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_demographics ENABLE ROW LEVEL SECURITY;

-- Create policies for test_competitors
CREATE POLICY "Users can view test competitors"
  ON public.test_competitors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = test_competitors.test_id
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = ts.company_id
        AND profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage test competitors"
  ON public.test_competitors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = test_competitors.test_id
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = ts.company_id
        AND profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'member')
      )
    )
  );

-- Create policies for test_variations
CREATE POLICY "Users can view test variations"
  ON public.test_variations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = test_variations.test_id
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = ts.company_id
        AND profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage test variations"
  ON public.test_variations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = test_variations.test_id
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = ts.company_id
        AND profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'member')
      )
    )
  );

-- Create policies for test_demographics
CREATE POLICY "Users can view test demographics"
  ON public.test_demographics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = test_demographics.test_id
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = ts.company_id
        AND profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage test demographics"
  ON public.test_demographics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = test_demographics.test_id
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = ts.company_id
        AND profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'member')
      )
    )
  );

-- Create indexes
CREATE INDEX test_sessions_company_id_idx ON public.test_sessions(company_id);
CREATE INDEX test_sessions_user_id_idx ON public.test_sessions(user_id);
CREATE INDEX test_competitors_test_id_idx ON public.test_competitors(test_id);
CREATE INDEX test_variations_test_id_idx ON public.test_variations(test_id);
CREATE INDEX test_demographics_test_id_idx ON public.test_demographics(test_id);