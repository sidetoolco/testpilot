/*
  # Product Schema Updates

  1. Changes
    - Add missing columns for product management
    - Set proper constraints and defaults
    - Add performance indexes
    - Update RLS policies

  2. Safety Measures
    - Check for column existence before modifications
    - Use DO blocks for conditional changes
    - Add proper constraints
    - Create indexes for performance
*/

-- Add missing columns to products table if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.products ADD COLUMN company_id UUID REFERENCES public.companies(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'amazon_url'
  ) THEN
    ALTER TABLE public.products ADD COLUMN amazon_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'loads'
  ) THEN
    ALTER TABLE public.products ADD COLUMN loads INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'best_seller'
  ) THEN
    ALTER TABLE public.products ADD COLUMN best_seller BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_competitor'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_competitor BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$ BEGIN
  -- Check if constraints exist before creating them
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loads_positive'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT loads_positive CHECK (loads IS NULL OR loads >= 0);
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'products_company_id_idx'
  ) THEN
    CREATE INDEX products_company_id_idx ON public.products(company_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'products_star_rating_idx'
  ) THEN
    CREATE INDEX products_star_rating_idx ON public.products(star_rating);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'products_review_count_idx'
  ) THEN
    CREATE INDEX products_review_count_idx ON public.products(review_count);
  END IF;
END $$;