-- ============================================================
-- Migration 00023: Fix group co-member profile visibility
-- ============================================================
-- ROOT CAUSE:
--   The profiles table has a single SELECT policy:
--     "Users can view own profile" → USING (auth.uid() = id)
--   This makes every other user's profile row invisible.
--   When useGroupMembers() does:
--     .select('*, profiles!inner(name, email)').eq('group_id', groupId)
--   the PostgREST join silently drops all rows whose profile is not
--   the caller's own, so each user only sees themselves in the members list.
--
-- FIX:
--   1. Add a SECURITY DEFINER helper: shares_group_with(viewer, target)
--      that returns TRUE if viewer and target share at least one group.
--      (Uses SECURITY DEFINER so it can bypass RLS on group_members
--       without creating a recursive policy loop.)
--   2. Add a new SELECT policy on profiles:
--      "Group co-members can view each other's profiles"
--      → Allows reading basic profile info when shares_group_with().
--
-- SECURITY PROPERTIES PRESERVED:
--   • Users can still always read their own profile.
--   • A user who shares NO group with another user still cannot see
--     that user's profile.
--   • Unrelated accounts (Account C) cannot see profiles of groups
--     they don't belong to.
--   • RLS is never disabled on any table.
--   • No table is made publicly readable.
-- ============================================================


-- ----------------------------------------------------------------
-- Step 1: SECURITY DEFINER helper — shares_group_with(viewer, target)
-- Returns TRUE if `viewer` and `target` are both members of the
-- same group. Uses SECURITY DEFINER to avoid RLS recursion on
-- group_members (same pattern as is_group_member in migration 00021).
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.shares_group_with(
  p_viewer UUID,
  p_target UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm_viewer
    JOIN public.group_members gm_target
      ON gm_viewer.group_id = gm_target.group_id
    WHERE gm_viewer.user_id = p_viewer
      AND gm_target.user_id = p_target
  );
$$;

GRANT EXECUTE ON FUNCTION public.shares_group_with(UUID, UUID) TO authenticated;


-- ----------------------------------------------------------------
-- Step 2: Add co-member profile visibility policy on profiles.
-- This is additive — the existing "Users can view own profile"
-- policy is left intact. RLS combines multiple SELECT policies
-- with OR logic, so a row is visible if ANY policy allows it.
-- ----------------------------------------------------------------
CREATE POLICY "Group co-members can view each other's profiles"
  ON public.profiles
  FOR SELECT
  USING (
    public.shares_group_with(auth.uid(), id)
  );


-- ----------------------------------------------------------------
-- Step 3: Also ensure that the search_users() function (migration
-- 00019) can return results for users who are group co-members.
-- It is already SECURITY DEFINER so it bypasses RLS internally,
-- but we document the intent here for clarity.
-- No SQL change needed for search_users.
-- ----------------------------------------------------------------


-- ----------------------------------------------------------------
-- Verification note (manual, not automated):
-- After applying this migration, run the following in the Supabase
-- SQL editor as User A (substitute real UUIDs):
--
--   SELECT * FROM profiles WHERE id = '<user_b_id>';
--   -- Should return User B's profile if A and B share a group.
--   -- Should return 0 rows if they do NOT share a group.
--
-- And confirm group member list returns both users:
--   SELECT gm.*, p.name, p.email
--   FROM group_members gm
--   JOIN profiles p ON p.id = gm.user_id
--   WHERE gm.group_id = '<group_id>';
-- ----------------------------------------------------------------
