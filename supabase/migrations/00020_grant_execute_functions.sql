-- Grant EXECUTE on all PostgreSQL functions that are called from the frontend
-- via supabase.rpc(). Without explicit GRANTs, the authenticated role cannot
-- call these functions when auto_expose_new_tables is disabled (the new default).

-- create_group: called by useCreateGroup hook
GRANT EXECUTE ON FUNCTION create_group(TEXT) TO authenticated;

-- is_session_valid: called by useDeviceSession hook
GRANT EXECUTE ON FUNCTION is_session_valid(UUID, TEXT) TO authenticated;

-- set_active_session: called by useDeviceSession hook
GRANT EXECUTE ON FUNCTION set_active_session(UUID, TEXT) TO authenticated;

-- Note: search_users already has GRANT in migration 00019.
-- Note: create_group_expense, create_individual_debt, settle_debt,
--   cancel_obligation, cancel_expense, create_notification are called from
--   Edge Functions using the service_role key, which bypasses GRANTs.
