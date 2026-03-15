-- Update 3
-- Update 2
-- Update 1
-- Admin User Management Migration

-- 1. Add is_suspended to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- 2. Function to terminate user sessions (requires sufficient privileges, usually only possible via Supabase Dashboard SQL editor or Service Role)
-- We will try to create a function that deletes from auth.sessions matching the user_id.
-- Note: This might fail if the postgres role doesn't have permissions on auth schema, but in standard Supabase setup it often does.
CREATE OR REPLACE FUNCTION public.terminate_user_sessions(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if the executor is an admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM auth.sessions WHERE user_id = target_user_id;
END;
$$;

-- 3. Function to Block/Unblock user
CREATE OR REPLACE FUNCTION public.toggle_user_suspension(target_user_id UUID, suspend_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
     RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.profiles
  SET is_suspended = suspend_status
  WHERE id = target_user_id;

  -- If suspending, also terminate sessions
  IF suspend_status = TRUE THEN
    PERFORM public.terminate_user_sessions(target_user_id);
  END IF;
END;
$$;
