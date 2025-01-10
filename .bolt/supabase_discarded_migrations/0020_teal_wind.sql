/*
  # Update Test Tables Migration
  
  1. Adds missing columns to tests table if needed
  2. Adds missing columns to test_sessions table if needed
  3. Ensures proper constraints and indexes
*/

DO $$ BEGIN
  -- Add missing columns to tests table if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' AND column_name = 'search_term'
  ) THEN
    ALTER TABLE public.tests ADD COLUMN search_term TEXT NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' AND column_name = 'settings'
  ) THEN
    ALTER TABLE public.tests ADD COLUMN settings JSONB DEFAULT '{}';
  END IF;

  -- Add missing columns to test_sessions table if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'test_sessions' AND column_name = 'tester_age'
  ) THEN
    ALTER TABLE public.test_sessions ADD COLUMN tester_age INTEGER CHECK (tester_age > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'test_sessions' AND column_name = 'tester_gender'
  ) THEN
    ALTER TABLE public.test_sessions ADD COLUMN tester_gender TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'test_sessions' AND column_name = 'tester_country'
  ) THEN
    ALTER TABLE public.test_sessions ADD COLUMN tester_country TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'test_sessions' AND column_name = 'device'
  ) THEN
    ALTER TABLE public.test_sessions ADD COLUMN device TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'test_sessions' AND column_name = 'duration'
  ) THEN
    ALTER TABLE public.test_sessions ADD COLUMN duration TEXT;
  END IF;

  -- Add missing constraints
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'test_sessions' AND constraint_name = 'test_sessions_outcome_check'
  ) THEN
    ALTER TABLE public.test_sessions 
    ADD CONSTRAINT test_sessions_outcome_check 
    CHECK (outcome IN ('selected_our_product', 'selected_competitor'));
  END IF;

  -- Create missing indexes if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'tests' AND indexname = 'tests_company_id_idx'
  ) THEN
    CREATE INDEX tests_company_id_idx ON public.tests(company_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'test_sessions' AND indexname = 'test_sessions_test_id_idx'
  ) THEN
    CREATE INDEX test_sessions_test_id_idx ON public.test_sessions(test_id);
  END IF;

  -- Enable RLS if not already enabled
  ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

END $$;