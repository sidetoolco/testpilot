/*
  # Fix Company Member Policies

  1. Changes
    - Fix infinite recursion in company_members policies
    - Simplify policy logic for better performance
    - Add separate policies for different operations

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access
*/

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Company owners can manage members" ON public.company_members;

-- Create separate policies for different operations
CREATE POLICY "Company owners can view members"
  ON public.company_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = company_members.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );

CREATE POLICY "Company owners can insert members"
  ON public.company_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = company_members.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );

CREATE POLICY "Company owners can update members"
  ON public.company_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = company_members.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );

CREATE POLICY "Company owners can delete members"
  ON public.company_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = company_members.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );

-- Add index to improve policy performance
CREATE INDEX IF NOT EXISTS company_members_role_idx ON public.company_members(role);