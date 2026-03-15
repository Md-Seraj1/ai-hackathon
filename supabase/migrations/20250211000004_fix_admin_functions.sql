-- Update 3
-- Update 2
-- Update 1
-- Fix Admin Check Logic in User Management Functions

-- 1. Redefine toggle_user_suspension to rely on the admin_users table (via is_admin())
CREATE OR REPLACE FUNCTION public.toggle_user_suspension(target_user_id UUID, suspend_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Strict Check: Must exist in admin_users table
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()) THEN
     RAISE EXCEPTION 'Access denied. You must be an Administrator to perform this action.';
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

-- 2. Redefine terminate_user_sessions to rely on the admin_users table
CREATE OR REPLACE FUNCTION public.terminate_user_sessions(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Strict Check: Must exist in admin_users table
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. You must be an Administrator to perform this action.';
  END IF;

  -- Delete from auth.sessions
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  
  -- Invalidate tokens via metadata update
  UPDATE auth.users SET raw_app_meta_data = 
    raw_app_meta_data || jsonb_build_object('token_revocation_time', extract(epoch from now()))
  WHERE id = target_user_id;
END;
$$;

-- 3. Grant execute permissions again just to be sure
GRANT EXECUTE ON FUNCTION public.toggle_user_suspension(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.terminate_user_sessions(UUID) TO authenticated;
