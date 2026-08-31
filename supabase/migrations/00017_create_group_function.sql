-- PostgreSQL function: create_group
-- Creates a group and adds the creator as initial admin atomically.
-- Uses SECURITY DEFINER with safe search_path to avoid privilege escalation.
CREATE OR REPLACE FUNCTION create_group(
  p_name TEXT
) RETURNS JSONB AS $$
DECLARE
  v_group_id UUID;
BEGIN
  -- Validate group name
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Group name cannot be empty';
  END IF;

  IF length(p_name) > 100 THEN
    RAISE EXCEPTION 'Group name cannot exceed 100 characters';
  END IF;

  -- Create the group
  INSERT INTO groups (name, created_by)
  VALUES (trim(p_name), auth.uid())
  RETURNING id INTO v_group_id;

  -- Add creator as initial admin member
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_group_id, auth.uid(), 'admin');

  RETURN jsonb_build_object(
    'id', v_group_id,
    'name', trim(p_name),
    'created_by', auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public;
