/*
  # Add Company Schema and Relationships

  1. New Tables
    - `companies`
      - Basic company information
      - Tracks company settings and metadata
    
    - `company_members`
      - Links users to companies
      - Handles role-based access
    
  2. Changes
    - Add company_id to products table
    - Add company_id to existing tables
    
  3. Security
    - Enable RLS on all tables
    - Add policies for company-based access
*/

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create company_members table for user-company relationships
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Add company_id to products table
ALTER TABLE public.products 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Create tests table
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  settings JSONB DEFAULT '{}',
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view companies they are members of"
  ON public.companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = companies.id
      AND company_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Company owners and admins can update company"
  ON public.companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = companies.id
      AND company_members.user_id = auth.uid()
      AND company_members.role IN ('owner', 'admin')
    )
  );

-- Company members policies
CREATE POLICY "Users can view company members of their companies"
  ON public.company_members
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can manage members"
  ON public.company_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = company_members.company_id
      AND company_members.user_id = auth.uid()
      AND company_members.role = 'owner'
    )
  );

-- Update products policies for company context
DROP POLICY IF EXISTS "Users can view own products" ON public.products;
DROP POLICY IF EXISTS "Users can create own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;

CREATE POLICY "Users can view company products"
  ON public.products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = products.company_id
      AND company_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company products"
  ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = products.company_id
      AND company_members.user_id = auth.uid()
      AND company_members.role IN ('owner', 'admin', 'member')
    )
  );

-- Tests policies
CREATE POLICY "Users can view company tests"
  ON public.tests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = tests.company_id
      AND company_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company tests"
  ON public.tests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = tests.company_id
      AND company_members.user_id = auth.uid()
      AND company_members.role IN ('owner', 'admin', 'member')
    )
  );

-- Create indexes
CREATE INDEX company_members_user_id_idx ON public.company_members(user_id);
CREATE INDEX company_members_company_id_idx ON public.company_members(company_id);
CREATE INDEX products_company_id_idx ON public.products(company_id);
CREATE INDEX tests_company_id_idx ON public.tests(company_id);