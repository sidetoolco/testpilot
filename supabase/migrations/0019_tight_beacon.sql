/*
  # Update Product Schema
  
  1. Changes
    - Remove category column
    - Add star_rating column (1-5)
    - Add review_count column
    
  2. Security
    - Maintain existing RLS policies
*/

-- Remove category column
ALTER TABLE public.products DROP COLUMN IF EXISTS category;

-- Add star rating and review count columns
ALTER TABLE public.products 
  ADD COLUMN star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  ADD COLUMN review_count INTEGER DEFAULT 0 CHECK (review_count >= 0);

-- Update existing records to have default values
UPDATE public.products 
SET 
  star_rating = 5,
  review_count = 0
WHERE star_rating IS NULL;