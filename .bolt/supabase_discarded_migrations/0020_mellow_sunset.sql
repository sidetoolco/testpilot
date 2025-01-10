/*
  # Add Missing Insights Table Columns and Indexes
  
  1. Adds type and content columns to insights table
  2. Adds session_id foreign key column
  3. Creates performance indexes
  4. Enables RLS
*/

-- Add missing columns
ALTER TABLE public.insights 
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS content JSONB,
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.test_sessions(id);

-- Update NOT NULL constraints separately to handle existing rows
UPDATE public.insights SET type = 'default' WHERE type IS NULL;
UPDATE public.insights SET content = '{}' WHERE content IS NULL;

ALTER TABLE public.insights 
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN content SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS insights_test_id_idx ON public.insights(test_id);
CREATE INDEX IF NOT EXISTS insights_session_id_idx ON public.insights(session_id);

-- Enable RLS
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;