/*
  # Update RLS Policies Migration
  
  1. Safely drops existing policies before recreating them
  2. Adds policies for all tables with proper checks
  3. Ensures consistent access control across the application
*/

DO $$ BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
  DROP POLICY IF EXISTS "Company owners and admins can update company" ON public.companies;
  DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
  DROP POLICY IF EXISTS "Company owners can delete their company" ON public.companies;
  DROP POLICY IF EXISTS "Users can view company products" ON public.products;
  DROP POLICY IF EXISTS "Users can manage company products" ON public.products;
  DROP POLICY IF EXISTS "Users can view company tests" ON public.tests;
  DROP POLICY IF EXISTS "Users can manage company tests" ON public.tests;
  DROP POLICY IF EXISTS "Users can view company test sessions" ON public.test_sessions;
  DROP POLICY IF EXISTS "Users can view company insights" ON public.insights;

  -- Recreate all policies
  -- Profiles
  CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

  -- Companies
  CREATE POLICY "Users can view their company"
    ON public.companies FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = companies.id
        AND profiles.id = auth.uid()
      )
    );

  CREATE POLICY "Company owners and admins can update company"
    ON public.companies FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = companies.id
        AND profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin')
      )
    );

  CREATE POLICY "Users can create companies"
    ON public.companies FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Company owners can delete their company"
    ON public.companies FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = companies.id
        AND profiles.id = auth.uid()
        AND profiles.role = 'owner'
      )
    );

  -- Products
  CREATE POLICY "Users can view company products"
    ON public.products FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = products.company_id
        AND profiles.id = auth.uid()
      )
    );

  CREATE POLICY "Users can manage company products"
    ON public.products FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = products.company_id
        AND profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'member')
      )
    );

  -- Tests
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

  -- Test Sessions
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

  -- Insights
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

END $$;