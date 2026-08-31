-- Add active_session_id column to profiles
-- (This may already exist from migration 00001, but we ensure it's there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'active_session_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN active_session_id TEXT;
  END IF;
END $$;

-- Function to set active session (called on login)
-- Returns: 'new' (first login), 'same' (same device re-login), 'takeover' (new device displaced old)
CREATE OR REPLACE FUNCTION set_active_session(
  p_user_id UUID,
  p_session_id TEXT
) RETURNS TEXT AS $$
DECLARE
  v_current_session TEXT;
  v_result TEXT;
BEGIN
  -- Get current active session under lock
  SELECT active_session_id INTO v_current_session
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_session IS NULL THEN
    -- First login: no previous session
    v_result := 'new';
  ELSIF v_current_session = p_session_id THEN
    -- Same device re-login
    v_result := 'same';
  ELSE
    -- Different device: takeover
    v_result := 'takeover';
  END IF;

  -- Always update to the new session
  UPDATE profiles
  SET active_session_id = p_session_id
  WHERE id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public;

-- Function to check if session is valid
-- Returns true if the given session_id matches the current active session
CREATE OR REPLACE FUNCTION is_session_valid(
  p_user_id UUID,
  p_session_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_active_session TEXT;
BEGIN
  SELECT active_session_id INTO v_active_session
  FROM profiles
  WHERE id = p_user_id;

  -- Invalid if another session is active and it's not this one
  IF v_active_session IS NULL THEN
    -- No session recorded yet (edge case: profile created but set_active_session not called)
    RETURN TRUE;
  END IF;

  RETURN v_active_session = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public;
