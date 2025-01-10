-- Create amazon_products table if it doesn't exist
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

-- Enable RLS if not already enabled
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'amazon_products' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.amazon_products ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view company amazon products" ON public.amazon_products;
DROP POLICY IF EXISTS "Users can manage company amazon products" ON public.amazon_products;

-- Create new policies
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

-- Create indexes if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'amazon_products_company_id_idx'
  ) THEN
    CREATE INDEX amazon_products_company_id_idx ON public.amazon_products(company_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'amazon_products_search_term_idx'
  ) THEN
    CREATE INDEX amazon_products_search_term_idx ON public.amazon_products(search_term);
  END IF;
END $$;