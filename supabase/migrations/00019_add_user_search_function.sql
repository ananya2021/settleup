-- User search function for finding other Split Pay users.
-- Returns minimum necessary data (id, name, email) for user selection.
-- Requires authentication. Excludes the caller. Limits results to 10.

CREATE OR REPLACE FUNCTION search_users(p_query TEXT)
RETURNS JSONB AS $$
BEGIN
  IF p_query IS NULL OR length(trim(p_query)) < 2 THEN
    RAISE EXCEPTION 'Search query must be at least 2 characters';
  END IF;

  RETURN (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'email', p.email
        )
      ),
      '[]'::JSONB
    )
    FROM profiles p
    WHERE p.id != auth.uid()
      AND (
        p.email ILIKE trim(p_query) || '%'
        OR p.name ILIKE '%' || trim(p_query) || '%'
      )
    ORDER BY p.name ASC
    LIMIT 10
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION search_users(TEXT) TO authenticated;
