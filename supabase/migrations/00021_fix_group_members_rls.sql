-- Fix recursive RLS policies on group_members.
-- The helper functions run as the function owner and therefore
-- can safely inspect group_members without triggering its RLS policy.

CREATE OR REPLACE FUNCTION public.is_group_member(
  p_group_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(
  p_group_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_group_member(UUID, UUID)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_group_admin(UUID, UUID)
TO authenticated;


-- Remove the recursive policies.
DROP POLICY IF EXISTS "Members can view group members"
ON public.group_members;

DROP POLICY IF EXISTS "Admins can add members"
ON public.group_members;


-- Replace them with policies that use the SECURITY DEFINER helpers.

CREATE POLICY "Members can view group members"
ON public.group_members
FOR SELECT
USING (
  public.is_group_member(group_id, auth.uid())
);

CREATE POLICY "Admins can add members"
ON public.group_members
FOR INSERT
WITH CHECK (
  public.is_group_admin(group_id, auth.uid())
);
