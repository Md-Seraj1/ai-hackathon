-- Update 2
-- Update 1
-- Fix User Management Permissions and Data

-- 1. Grant Execute Permissions to Authenticated Users
-- The functions check for is_admin internally, so it is safe to allow authenticated users to call them.
GRANT EXECUTE ON FUNCTION public.toggle_user_suspension(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.terminate_user_sessions(UUID) TO authenticated;

-- 2. Backfill Email addresses from auth.users to profiles
-- This requires privileges to read auth.users, which the postgres role usually has.
DO $$
BEGIN
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id
    AND (p.email IS NULL OR p.email = '');
END $$;

-- 3. Ensure is_suspended defaults to false for existing records
UPDATE public.profiles SET is_suspended = FALSE WHERE is_suspended IS NULL;

-- 4. Improve terminate_user_sessions to be more robust
CREATE OR REPLACE FUNCTION public.terminate_user_sessions(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if the executor is an admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  -- Delete from auth.sessions
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  
  -- Also update the security timestamp in auth.users to invalidate tokens
  -- This forces a logout even if the session table deletion misses something
  -- Note: This requires the function to have update access to auth.users (usually works with SECURITY DEFINER)
  UPDATE auth.users SET raw_app_meta_data = 
    raw_app_meta_data || jsonb_build_object('token_revocation_time', extract(epoch from now()))
  WHERE id = target_user_id;
END;
$$;
