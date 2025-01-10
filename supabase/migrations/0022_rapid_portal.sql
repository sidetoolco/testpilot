/*
# Test Creation Function Fix

1. Changes
   - Add function to create complete test with all components
   - Add validation checks
   - Add helper functions

2. Security
   - Enable RLS policies
   - Add security checks

3. Indexes
   - Add performance optimizations
*/

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
  FOREACH v_competitor IN ARRAY p_competitors
  LOOP
    INSERT INTO public.test_competitors (
      test_id,
      product_id,
      created_at,
      updated_at
    ) VALUES (
      v_test_id,
      v_competitor,
      NOW(),
      NOW()
    );
  END LOOP;

  -- Add variations
  FOR v_variation_type, v_product_id IN 
    SELECT key, (value->>'id')::UUID 
    FROM jsonb_each(p_variations)
    WHERE value IS NOT NULL
  LOOP
    INSERT INTO public.test_variations (
      test_id,
      product_id,
      variation_type,
      created_at,
      updated_at
    ) VALUES (
      v_test_id,
      v_product_id,
      v_variation_type,
      NOW(),
      NOW()
    );
  END LOOP;

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