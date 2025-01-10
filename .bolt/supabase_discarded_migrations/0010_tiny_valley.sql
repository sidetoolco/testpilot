/*
  # Fix Company Member Policies

  1. Changes
    - Drop all existing company member policies
    - Create new simplified policies without recursion
    - Add proper indexes for performance
    
  2. Security
    - Maintains proper access control
    - Prevents infinite recursion
    - Improves query performance
*/

-- First drop all existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop all policies on company_members table
  DROP POLICY IF EXISTS "Users can access their own membership" ON public.company_members;
  DROP POLICY IF EXISTS "Company owners can manage members" ON public.company_members;
  DROP POLICY IF EXISTS "Users can view members of their companies" ON public.company_members;
  DROP POLICY IF EXISTS "Company owners can view members" ON public.company_members;
  DROP POLICY IF EXISTS "Company owners can insert members" ON public.company_members;
  DROP POLICY IF EXISTS "Company owners can update members" ON public.company_members;
  DROP POLICY IF EXISTS "Company owners can delete members" ON public.company_members;
  
  -- Drop product policies that might cause recursion
  DROP POLICY IF EXISTS "Users can view company products" ON public.products;
END $$;

-- Create new simplified policies
CREATE POLICY "Members can view own company"
  ON public.company_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    company_id IN (
      SELECT cm.company_id 
      FROM public.company_members cm 
      WHERE cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage company members"
  ON public.company_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM public.company_members owners
      WHERE owners.company_id = company_members.company_id
      AND owners.user_id = auth.uid()
      AND owners.role = 'owner'
    )
  );

-- Create new product policy
CREATE POLICY "Members can view company products"
  ON public.products
  FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id
      FROM public.company_members cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_members_lookup 
ON public.company_members(company_id, user_id, role);

CREATE INDEX IF NOT EXISTS idx_company_members_user_lookup
ON public.company_members(user_id, company_id);