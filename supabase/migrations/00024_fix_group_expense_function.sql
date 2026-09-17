-- PostgreSQL function: create_group_expense (corrected for Edge Function / service_role callers)
CREATE OR REPLACE FUNCTION create_group_expense(
  p_group_id UUID,
  p_paid_by UUID,
  p_description TEXT,
  p_total_amount INTEGER,
  p_split_type TEXT,
  p_splits JSONB  -- [{ "user_id": "UUID", "amount": INTEGER }, ...]
) RETURNS JSONB AS $$
DECLARE
  v_expense_id UUID;
  v_split JSONB;
  v_sum INTEGER := 0;
  v_split_count INTEGER := 0;
  v_caller_id UUID := auth.uid();
BEGIN
  -- If called directly by authenticated user (non-service-role), enforce paid_by is caller
  IF v_caller_id IS NOT NULL AND p_paid_by != v_caller_id THEN
    RAISE EXCEPTION 'paid_by must match authenticated user';
  END IF;

  -- Validate payer is a member of the group
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id AND user_id = p_paid_by
  ) THEN
    RAISE EXCEPTION 'Payer is not a group member';
  END IF;

  -- Validate caller (if auth.uid() present) is a member of the group
  IF v_caller_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id AND user_id = v_caller_id
  ) THEN
    RAISE EXCEPTION 'Caller is not a group member';
  END IF;

  -- Validate total_amount > 0
  IF p_total_amount <= 0 THEN
    RAISE EXCEPTION 'Total amount must be positive';
  END IF;

  -- Validate splits
  FOR v_split IN SELECT * FROM jsonb_array_elements(p_splits) LOOP
    v_sum := v_sum + (v_split->>'amount')::INTEGER;
    v_split_count := v_split_count + 1;
    IF (v_split->>'amount')::INTEGER <= 0 THEN
      RAISE EXCEPTION 'Each split amount must be positive';
    END IF;

    -- Validate each split participant is a member of the group
    IF NOT EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = p_group_id AND user_id = (v_split->>'user_id')::UUID
    ) THEN
      RAISE EXCEPTION 'Participant % is not a group member', (v_split->>'user_id');
    END IF;
  END LOOP;

  -- Validate sum matches total
  IF v_sum != p_total_amount THEN
    RAISE EXCEPTION 'Split amounts (%) must equal total amount (%)', v_sum, p_total_amount;
  END IF;

  -- Validate at least 2 participants
  IF v_split_count < 2 THEN
    RAISE EXCEPTION 'At least 2 splits required';
  END IF;

  -- Insert expense
  INSERT INTO expenses (group_id, paid_by, description, total_amount, split_type)
  VALUES (p_group_id, p_paid_by, p_description, p_total_amount, p_split_type)
  RETURNING id INTO v_expense_id;

  -- Insert all splits (including payer) and create obligations for non-payers
  FOR v_split IN SELECT * FROM jsonb_array_elements(p_splits) LOOP
    INSERT INTO expense_splits (expense_id, user_id, amount)
    VALUES (v_expense_id, (v_split->>'user_id')::UUID, (v_split->>'amount')::INTEGER);

    -- Create obligation only for non-payer participants
    IF (v_split->>'user_id')::UUID != p_paid_by THEN
      INSERT INTO obligations (
        group_id, expense_id, creditor_id, debtor_id,
        original_amount, source, source_reference
      ) VALUES (
        p_group_id, v_expense_id, p_paid_by, (v_split->>'user_id')::UUID,
        (v_split->>'amount')::INTEGER, 'group_expense', v_expense_id
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'expense_id', v_expense_id,
    'status', 'created'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;
