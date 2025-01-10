/*
  # Safe Products Policies Migration
  
  Safely adds RLS policies and indexes for products table without recreating the table.
  Handles the case where some policies may already exist.
*/

-- Safely enable RLS on products if not already enabled
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create products policies
DO $$ BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view company products" ON public.products;
  DROP POLICY IF EXISTS "Users can manage company products" ON public.products;

  -- Create new policies
  CREATE POLICY "Users can view company products"
    ON public.products FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = products.company_id
        AND profiles.id = auth.uid()
      )
    );

  CREATE POLICY "Users can manage company products"
    ON public.products FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.company_id = products.company_id
        AND profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin', 'member')
      )
    );
END $$;

-- Safely create products index if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND indexname = 'products_company_id_idx'
  ) THEN
    CREATE INDEX products_company_id_idx ON public.products(company_id);
  END IF;
END $$;