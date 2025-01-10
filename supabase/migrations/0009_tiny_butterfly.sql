-- Drop and recreate company members policies to avoid recursion
DROP POLICY IF EXISTS "Users can view company members of their companies" ON public.company_members;
DROP POLICY IF EXISTS "Company owners can view members" ON public.company_members;
DROP POLICY IF EXISTS "Company owners can insert members" ON public.company_members;
DROP POLICY IF EXISTS "Company owners can update members" ON public.company_members;
DROP POLICY IF EXISTS "Company owners can delete members" ON public.company_members;

-- Create simplified policies without recursive checks
CREATE POLICY "Users can view members of their companies"
  ON public.company_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    company_id IN (
      SELECT company_id 
      FROM public.company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can manage members"
  ON public.company_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM public.company_members 
      WHERE company_id = company_members.company_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Ensure waiting list is properly initialized
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    waiting_list,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    waiting_list = FALSE,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update any existing profiles to ensure waiting_list is false
UPDATE public.profiles SET waiting_list = FALSE WHERE waiting_list IS NULL OR waiting_list = TRUE;