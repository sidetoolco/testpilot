/*
  # Waiting List Management Fix

  1. Changes
    - Add function to automatically set waiting_list to false for new users
    - Update existing handle_new_user function
    - Add function to manage waiting list status

  2. Security
    - Functions run with security definer to ensure proper access
*/

-- Update handle_new_user function to set waiting_list to false by default
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
    FALSE, -- Set waiting_list to false by default
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    waiting_list = FALSE, -- Ensure waiting_list is false on update
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to manage waiting list status
CREATE OR REPLACE FUNCTION public.manage_waiting_list(user_id UUID, status BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    waiting_list = status,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles to set waiting_list to false
UPDATE public.profiles SET waiting_list = FALSE WHERE waiting_list = TRUE;