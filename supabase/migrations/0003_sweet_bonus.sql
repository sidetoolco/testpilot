/*
  # Fix User Table Structure
  
  1. Changes
    - Drop duplicate users table
    - Ensure profiles table has all necessary columns
    - Update triggers and functions
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop the duplicate users table if it exists
DROP TABLE IF EXISTS public.users;

-- Ensure profiles table has all necessary columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update handle_new_user function to include all fields
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
    TRUE,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;