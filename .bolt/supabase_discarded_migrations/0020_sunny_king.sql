/*
  # Fix Profiles and Companies Migration
  
  1. Enables UUID extension
  2. Updates profiles table structure
  3. Creates companies table if needed
  4. Sets up foreign key relationships
  5. Enables RLS and creates indexes
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS public.profiles 
  DROP CONSTRAINT IF EXISTS fk_profiles_company;

-- Add or update profiles table columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS waiting_list BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS company_joined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add role constraint
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS check_valid_role;

ALTER TABLE public.profiles 
  ADD CONSTRAINT check_valid_role 
  CHECK (role IN ('owner', 'admin', 'member'));

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_company
  FOREIGN KEY (company_id)
  REFERENCES public.companies(id)
  ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles(company_id);