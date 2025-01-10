/*
  # Add Performance Indexes Migration
  
  Adds additional indexes to improve query performance for common operations:
  1. Indexes for frequently filtered columns
  2. Indexes for foreign key relationships
  3. Composite indexes for common query patterns
*/

-- Safely create indexes if they don't exist
DO $$ BEGIN
  -- Products indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND indexname = 'products_category_idx'
  ) THEN
    CREATE INDEX products_category_idx ON public.products(category);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND indexname = 'products_brand_idx'
  ) THEN
    CREATE INDEX products_brand_idx ON public.products(brand);
  END IF;

  -- Tests indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'tests' 
    AND indexname = 'tests_status_idx'
  ) THEN
    CREATE INDEX tests_status_idx ON public.tests(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'tests' 
    AND indexname = 'tests_created_by_idx'
  ) THEN
    CREATE INDEX tests_created_by_idx ON public.tests(created_by);
  END IF;

  -- Test sessions indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'test_sessions' 
    AND indexname = 'test_sessions_outcome_idx'
  ) THEN
    CREATE INDEX test_sessions_outcome_idx ON public.test_sessions(outcome);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'test_sessions' 
    AND indexname = 'test_sessions_selected_product_idx'
  ) THEN
    CREATE INDEX test_sessions_selected_product_idx ON public.test_sessions(selected_product_id);
  END IF;

  -- Insights indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'insights' 
    AND indexname = 'insights_type_idx'
  ) THEN
    CREATE INDEX insights_type_idx ON public.insights(type);
  END IF;

  -- Composite indexes for common query patterns
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND indexname = 'products_company_category_idx'
  ) THEN
    CREATE INDEX products_company_category_idx ON public.products(company_id, category);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'tests' 
    AND indexname = 'tests_company_status_idx'
  ) THEN
    CREATE INDEX tests_company_status_idx ON public.tests(company_id, status);
  END IF;
END $$;