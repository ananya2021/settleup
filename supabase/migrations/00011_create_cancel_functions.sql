-- PostgreSQL function: cancel_obligation
-- Cancels an obligation with reversal if partially/fully settled
CREATE OR REPLACE FUNCTION cancel_obligation(
  p_obligation_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_obligation RECORD;
  v_reversal_id UUID;
BEGIN
  -- Fetch and lock
  SELECT * INTO v_obligation
  FROM obligations
  WHERE id = p_obligation_id
  FOR UPDATE;

  -- Validate exists
  IF v_obligation IS NULL THEN
    RAISE EXCEPTION 'Obligation not found';
  END IF;

  -- Validate not already cancelled
  IF v_obligation.status = 'cancelled' THEN
    RAISE EXCEPTION 'Obligation is already cancelled';
  END IF;

  -- Validate caller is creditor
  IF v_obligation.creditor_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the creditor can cancel an obligation';
  END IF;

  -- Mark as cancelled
  UPDATE obligations
  SET status = 'cancelled',
      cancelled_at = NOW(),
      cancelled_by = auth.uid()
  WHERE id = p_obligation_id;

  -- Create reversal if there was any prior settlement
  IF v_obligation.settled_amount > 0 THEN
    INSERT INTO obligations (
      group_id, expense_id, creditor_id, debtor_id,
      original_amount, source, source_reference
    ) VALUES (
      v_obligation.group_id,
      NULL,
      v_obligation.debtor_id,  -- reversal: old debtor is now creditor
      v_obligation.creditor_id, -- old creditor is now debtor
      v_obligation.settled_amount,
      'reversal',
      p_obligation_id
    ) RETURNING id INTO v_reversal_id;
  END IF;

  RETURN jsonb_build_object(
    'cancelled', true,
    'reversal_obligation_id', v_reversal_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PostgreSQL function: cancel_expense
-- Cancels all obligations for an expense with reversals
CREATE OR REPLACE FUNCTION cancel_expense(
  p_expense_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_obligation RECORD;
  v_reversal_id UUID;
  v_results JSONB := '[]'::JSONB;
BEGIN
  -- Validate caller is group admin or expense creator
  IF NOT EXISTS (
    SELECT 1 FROM expenses e
    JOIN group_members gm ON gm.group_id = e.group_id
    WHERE e.id = p_expense_id
    AND gm.user_id = auth.uid()
    AND (gm.role = 'admin' OR e.paid_by = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Not authorized to cancel this expense';
  END IF;

  -- Cancel each obligation
  FOR v_obligation IN
    SELECT * FROM obligations
    WHERE expense_id = p_expense_id AND status != 'cancelled'
    FOR UPDATE
  LOOP
    -- Mark as cancelled
    UPDATE obligations
    SET status = 'cancelled',
        cancelled_at = NOW(),
        cancelled_by = auth.uid()
    WHERE id = v_obligation.id;

    -- Create reversal if needed
    v_reversal_id := NULL;
    IF v_obligation.settled_amount > 0 THEN
      INSERT INTO obligations (
        group_id, expense_id, creditor_id, debtor_id,
        original_amount, source, source_reference
      ) VALUES (
        v_obligation.group_id,
        NULL,
        v_obligation.debtor_id,
        v_obligation.creditor_id,
        v_obligation.settled_amount,
        'reversal',
        v_obligation.id
      ) RETURNING id INTO v_reversal_id;
    END IF;

    v_results := v_results || jsonb_build_object(
      'obligation_id', v_obligation.id,
      'reversal_id', v_reversal_id
    );
  END LOOP;

  RETURN jsonb_build_object(
    'expense_id', p_expense_id,
    'cancelled', true,
    'results', v_results
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
