/*
  # Amazon Products Schema

  1. New Tables
    - `amazon_products`
      - `id` (uuid, primary key)
      - `title` (text)
      - `price` (decimal)
      - `rating` (decimal)
      - `reviews_count` (integer)
      - `image_url` (text)
      - `product_url` (text) 
      - `search_term` (text)
      - `company_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create amazon_products table
CREATE TABLE IF NOT EXISTS public.amazon_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price DECIMAL(10,2),
  rating DECIMAL(2,1),
  reviews_count INTEGER,
  image_url TEXT,
  product_url TEXT,
  search_term TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.amazon_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view company amazon products"
  ON public.amazon_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = amazon_products.company_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company amazon products"
  ON public.amazon_products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.company_id = amazon_products.company_id
      AND profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin', 'member')
    )
  );

-- Create indexes
CREATE INDEX amazon_products_company_id_idx ON public.amazon_products(company_id);
CREATE INDEX amazon_products_search_term_idx ON public.amazon_products(search_term);