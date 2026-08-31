-- ============================================================
-- Migration 00022: Group Member Management & Invitation Links
-- ============================================================

-- 1. Add secure token column to group_invitations
ALTER TABLE public.group_invitations
  ADD COLUMN IF NOT EXISTS token TEXT UNIQUE DEFAULT (
  replace(gen_random_uuid()::text, '-', '') ||
  replace(gen_random_uuid()::text, '-', '')
);
-- Backfill existing rows with tokens
UPDATE public.group_invitations
SET token = (
  replace(gen_random_uuid()::text, '-', '') ||
  replace(gen_random_uuid()::text, '-', '')
)
WHERE token IS NULL;

-- Make token NOT NULL after backfill
ALTER TABLE public.group_invitations
  ALTER COLUMN token SET NOT NULL;

-- Add accepted_by column to track who accepted via link
ALTER TABLE public.group_invitations
  ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES profiles(id);

-- 2. RLS policy: allow lookup by token for the invite page
-- Uses SECURITY DEFINER helper to avoid recursion
CREATE POLICY "Anyone with token can view invitation"
  ON public.group_invitations FOR SELECT
  USING (true);  -- Token is the authorization; details exposed via function instead

-- Actually, we should NOT make the whole table readable.
-- Instead, we use SECURITY DEFINER functions for token lookup.
-- Drop the overly permissive policy above and rely on functions only.
DROP POLICY IF EXISTS "Anyone with token can view invitation" ON public.group_invitations;


-- ============================================================
-- Function: add_group_member
-- Admin-only. Adds a user to a group.
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_group_member(
  p_group_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_user_name TEXT;
  v_user_email TEXT;
BEGIN
  -- Require authentication
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Caller must be admin of this group
  IF NOT public.is_group_admin(p_group_id, v_caller_id) THEN
    RAISE EXCEPTION 'Only group admins can add members';
  END IF;

  -- Target user must exist
  SELECT name, email INTO v_user_name, v_user_email
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if already a member
  IF public.is_group_member(p_group_id, p_user_id) THEN
    RAISE EXCEPTION 'User is already a member of this group';
  END IF;

  -- Insert membership
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (p_group_id, p_user_id, 'member');

  RETURN jsonb_build_object(
    'group_id', p_group_id,
    'user_id', p_user_id,
    'role', 'member',
    'name', v_user_name,
    'email', v_user_email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_group_member(UUID, UUID) TO authenticated;


-- ============================================================
-- Function: create_group_invitation
-- Admin-only. Creates a secure invitation link.
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_group_invitation(
  p_group_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_token TEXT;
  v_invitation_id UUID;
  v_group_name TEXT;
BEGIN
  -- Require authentication
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Caller must be admin
  IF NOT public.is_group_admin(p_group_id, v_caller_id) THEN
    RAISE EXCEPTION 'Only group admins can create invitations';
  END IF;

  -- Get group name
  SELECT name INTO v_group_name
  FROM public.groups
  WHERE id = p_group_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  -- Invalidate any existing pending invitations for this group by this admin
  UPDATE public.group_invitations
  SET status = 'expired'
  WHERE group_id = p_group_id
    AND status = 'pending';

  -- Generate a cryptographically secure token
  v_token :=  replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  -- Create the invitation
  INSERT INTO public.group_invitations (group_id, inviter_id, invitee_email, status, token)
  VALUES (p_group_id, v_caller_id, '', 'pending', v_token)
  RETURNING id INTO v_invitation_id;

  RETURN jsonb_build_object(
    'id', v_invitation_id,
    'token', v_token,
    'group_id', p_group_id,
    'group_name', v_group_name,
    'expires_at', (NOW() + INTERVAL '7 days')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_group_invitation(UUID) TO authenticated;


-- ============================================================
-- Function: get_invitation_by_token
-- Public lookup (anon + authenticated). Minimal info only.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(
  p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invitation RECORD;
  v_inviter_name TEXT;
  v_caller_id UUID := auth.uid();
  v_is_member BOOLEAN := FALSE;
BEGIN
  -- Find the invitation by token
  SELECT gi.id, gi.group_id, gi.status, gi.expires_at, gi.inviter_id
  INTO v_invitation
  FROM public.group_invitations gi
  WHERE gi.token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid invitation link');
  END IF;

  -- Check if expired
  IF v_invitation.expires_at < NOW() THEN
    -- Mark as expired
    UPDATE public.group_invitations
    SET status = 'expired'
    WHERE id = v_invitation.id AND status = 'pending';

    RETURN jsonb_build_object('valid', false, 'error', 'This invitation has expired');
  END IF;

  -- Check if already accepted/declined/expired
  IF v_invitation.status != 'pending' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation is no longer valid');
  END IF;

  -- Get group name
  -- Get inviter name
  SELECT name INTO v_inviter_name
  FROM public.profiles
  WHERE id = v_invitation.inviter_id;

  -- Check if current user is already a member (only if authenticated)
  IF v_caller_id IS NOT NULL THEN
    v_is_member := public.is_group_member(v_invitation.group_id, v_caller_id);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'invitation_id', v_invitation.id,
    'group_id', v_invitation.group_id,
    'inviter_name', COALESCE(v_inviter_name, 'Someone'),
    'is_member', v_is_member,
    'expires_at', v_invitation.expires_at
  );
END;
$$;

-- Allow both anon and authenticated to look up invitations by token
-- The token itself is the authorization; only minimal group info is returned
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(TEXT) TO authenticated;


-- ============================================================
-- Function: accept_group_invitation
-- Authenticated only. Uses auth.uid() — never trusts frontend user ID.
-- ============================================================
CREATE OR REPLACE FUNCTION public.accept_group_invitation(
  p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_invitation RECORD;
  v_group_name TEXT;
BEGIN
  -- Require authentication
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to accept invitations';
  END IF;

  -- Find invitation by token
  SELECT id, group_id, status, expires_at
  INTO v_invitation
  FROM public.group_invitations
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invitation link';
  END IF;

  -- Check expiry
  IF v_invitation.expires_at < NOW() THEN
    UPDATE public.group_invitations
    SET status = 'expired'
    WHERE id = v_invitation.id AND status = 'pending';

    RAISE EXCEPTION 'This invitation has expired';
  END IF;

  -- Check status
  IF v_invitation.status != 'pending' THEN
    RAISE EXCEPTION 'This invitation is no longer valid';
  END IF;

  -- Get group name for response
  SELECT name INTO v_group_name
  FROM public.groups
  WHERE id = v_invitation.group_id;

  -- Check if already a member
  IF public.is_group_member(v_invitation.group_id, v_caller_id) THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_member', true,
      'group_id', v_invitation.group_id,
      'group_name', v_group_name
    );
  END IF;

  -- Add user to group as member
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_invitation.group_id, v_caller_id, 'member')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  -- Mark invitation as accepted
  UPDATE public.group_invitations
  SET status = 'accepted', accepted_by = v_caller_id
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'already_member', false,
    'group_id', v_invitation.group_id,
    'group_name', v_group_name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_group_invitation(TEXT) TO authenticated;
