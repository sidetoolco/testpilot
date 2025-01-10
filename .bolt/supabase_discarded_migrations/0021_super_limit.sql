/*
  # Amazon Products Schema Optimization

  1. Schema Changes
    - Add NOT NULL constraints
    - Add price and rating validations
    - Enable trigram search

  2. Indexes
    - Add company_id index
    - Add search_term index
    - Add reviews_count index for sorting
    - Add trigram index for fuzzy search
    - Add composite index for common queries
*/

-- Enable trigram extension if not enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ensure NOT NULL constraints and validations
DO $$ BEGIN
  -- Add NOT NULL constraints
  ALTER TABLE amazon_products
    ALTER COLUMN title SET NOT NULL,
    ALTER COLUMN price SET NOT NULL,
    ALTER COLUMN image_url SET NOT NULL,
    ALTER COLUMN search_term SET NOT NULL,
    ALTER COLUMN company_id SET NOT NULL;

  -- Add price validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'amazon_products_price_check'
  ) THEN
    ALTER TABLE amazon_products
      ADD CONSTRAINT amazon_products_price_check 
      CHECK (price >= 0);
  END IF;

  -- Add rating validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'amazon_products_rating_check'
  ) THEN
    ALTER TABLE amazon_products
      ADD CONSTRAINT amazon_products_rating_check 
      CHECK (rating >= 0 AND rating <= 5);
  END IF;
END $$;

-- Drop existing indexes to recreate them
DROP INDEX IF EXISTS amazon_products_company_id_idx;
DROP INDEX IF EXISTS amazon_products_search_term_idx;
DROP INDEX IF EXISTS amazon_products_reviews_count_idx;
DROP INDEX IF EXISTS amazon_products_search_term_trgm_idx;
DROP INDEX IF EXISTS amazon_products_search_company_idx;

-- Create optimized indexes
CREATE INDEX amazon_products_company_id_idx 
ON public.amazon_products(company_id);

CREATE INDEX amazon_products_search_term_idx 
ON public.amazon_products(search_term);

CREATE INDEX amazon_products_reviews_count_idx 
ON public.amazon_products(reviews_count DESC NULLS LAST);

-- Create trigram index for fuzzy search
CREATE INDEX amazon_products_search_term_trgm_idx 
ON public.amazon_products USING gin (search_term gin_trgm_ops);

-- Create composite index for common query pattern
CREATE INDEX amazon_products_search_company_idx 
ON public.amazon_products(company_id, search_term);