-- SQL Functions to Fix Authentication Issues
-- Run these in your Supabase SQL Editor

-- 1. Create function to confirm user email
CREATE OR REPLACE FUNCTION confirm_user_email(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$;

-- 2. Auto-confirm all existing users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 3. Create trigger to auto-confirm new users
CREATE OR REPLACE FUNCTION auto_confirm_new_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_confirm_trigger ON auth.users;

-- Create trigger for new users
CREATE TRIGGER auto_confirm_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_new_users();

-- 4. Check current user status
SELECT 
  email, 
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED'
    ELSE 'NOT CONFIRMED'
  END as status,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
