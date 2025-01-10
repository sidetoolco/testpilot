/*
# Test Creation Functions

1. New Functions
   - create_test: Creates a complete test with competitors, variations and demographics
   - validate_test_data: Helper function to validate test data integrity

2. Changes
   - Add transaction handling
   - Add data validation
   - Add performance indexes

3. Security
   - Functions are SECURITY DEFINER
   - Company ownership validation
*/

-- Create test tables if they don't exist
CREATE TABLE IF NOT EXISTS public.test_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variation_type TEXT CHECK (variation_type IN ('a', 'b', 'c')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  age_ranges JSONB,
  genders JSONB,
  locations JSONB,
  interests JSONB,
  tester_count INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to create complete test
CREATE OR REPLACE FUNCTION create_test(
  p_name TEXT,
  p_search_term TEXT,
  p_user_id UUID,
  p_company_id UUID,
  p_competitors UUID[],
  p_variations JSONB,
  p_demographics JSONB
)
RETURNS UUID AS $$
DECLARE
  v_test_id UUID;
  v_competitor UUID;
  v_variation_type TEXT;
  v_product_id UUID;
BEGIN
  -- Validate data first
  PERFORM validate_test_data(p_company_id, p_competitors, p_variations);

  -- Start transaction
  BEGIN
    -- Create test
    INSERT INTO public.tests (
      name,
      search_term,
      status,
      company_id,
      user_id,
      created_at,
      updated_at
    ) VALUES (
      p_name,
      p_search_term,
      'draft',
      p_company_id,
      p_user_id,
      NOW(),
      NOW()
    ) RETURNING id INTO v_test_id;

    -- Add competitors
    INSERT INTO public.test_competitors (
      test_id,
      product_id,
      created_at,
      updated_at
    )
    SELECT 
      v_test_id,
      unnest(p_competitors),
      NOW(),
      NOW();

    -- Add variations
    INSERT INTO public.test_variations (
      test_id,
      product_id,
      variation_type,
      created_at,
      updated_at
    )
    SELECT 
      v_test_id,
      (value->>'id')::UUID,
      key,
      NOW(),
      NOW()
    FROM jsonb_each(p_variations)
    WHERE value IS NOT NULL;

    -- Add demographics
    INSERT INTO public.test_demographics (
      test_id,
      age_ranges,
      genders,
      locations,
      interests,
      tester_count,
      created_at,
      updated_at
    ) VALUES (
      v_test_id,
      p_demographics->'ageRanges',
      p_demographics->'gender',
      p_demographics->'locations',
      p_demographics->'interests',
      (p_demographics->>'testerCount')::INTEGER,
      NOW(),
      NOW()
    );

    RETURN v_test_id;
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction on error
    RAISE EXCEPTION 'Failed to create test: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helper function to validate test data
CREATE OR REPLACE FUNCTION validate_test_data(
  p_company_id UUID,
  p_competitors UUID[],
  p_variations JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  -- Validate competitors exist and belong to company
  IF NOT EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = ANY(p_competitors)
    AND company_id = p_company_id
  ) THEN
    RAISE EXCEPTION 'Invalid competitor products';
  END IF;

  -- Validate variations exist and belong to company
  IF EXISTS (
    SELECT 1 
    FROM jsonb_each(p_variations) v
    WHERE v.value IS NOT NULL 
    AND NOT EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = (v.value->>'id')::UUID
      AND company_id = p_company_id
    )
  ) THEN
    RAISE EXCEPTION 'Invalid variation products';
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS tests_user_company_idx ON public.tests(user_id, company_id);
CREATE INDEX IF NOT EXISTS tests_status_idx ON public.tests(status);
CREATE INDEX IF NOT EXISTS test_competitors_test_idx ON public.test_competitors(test_id);
CREATE INDEX IF NOT EXISTS test_variations_test_idx ON public.test_variations(test_id);
CREATE INDEX IF NOT EXISTS test_demographics_test_idx ON public.test_demographics(test_id);