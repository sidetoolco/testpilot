/*
  # Update Product Schema

  1. Changes
    - Add star_rating and review_count columns with proper constraints
    - Remove category column
    - Add NOT NULL constraints with defaults
    - Add check constraints for valid ranges

  2. Data Migration
    - Set default values for existing records
*/

-- Add star rating and review count columns if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'star_rating'
  ) THEN
    ALTER TABLE public.products 
      ADD COLUMN star_rating INTEGER NOT NULL DEFAULT 5 
      CHECK (star_rating >= 1 AND star_rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE public.products 
      ADD COLUMN review_count INTEGER NOT NULL DEFAULT 0 
      CHECK (review_count >= 0);
  END IF;
END $$;

-- Remove category column if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.products DROP COLUMN category;
  END IF;
END $$;

-- Update any NULL values to defaults
UPDATE public.products 
SET 
  star_rating = COALESCE(star_rating, 5),
  review_count = COALESCE(review_count, 0)
WHERE star_rating IS NULL OR review_count IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS products_star_rating_idx ON public.products(star_rating);
CREATE INDEX IF NOT EXISTS products_review_count_idx ON public.products(review_count);