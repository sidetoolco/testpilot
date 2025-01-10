/*
  # Create RLS Policies
  
  1. Creates RLS policies for tests table
  2. Creates RLS policies for test_sessions table
  3. Creates RLS policies for insights table
*/

-- Tests policies
CREATE POLICY "Users can view company tests"
  ON public.tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = tests.company_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company tests"
  ON public.tests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = tests.company_id
      AND profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin', 'member')
    )
  );

-- Test Sessions policies
CREATE POLICY "Users can view company test sessions"
  ON public.test_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tests
      JOIN public.profiles ON profiles.company_id = tests.company_id
      WHERE test_sessions.test_id = tests.id
      AND profiles.id = auth.uid()
    )
  );

-- Insights policies
CREATE POLICY "Users can view company insights"
  ON public.insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tests
      JOIN public.profiles ON profiles.company_id = tests.company_id
      WHERE insights.test_id = tests.id
      AND profiles.id = auth.uid()
    )
  );