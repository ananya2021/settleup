-- PostgreSQL function: settle_debt
-- FIFO settlement allocation with overpayment rejection
CREATE OR REPLACE FUNCTION settle_debt(
  p_from_user_id UUID,  -- debtor (paying)
  p_to_user_id UUID,    -- creditor (receiving)
  p_amount INTEGER      -- payment amount
) RETURNS JSONB AS $$
DECLARE
  v_rec RECORD;
  v_remaining_payment INTEGER := p_amount;
  v_applied INTEGER;
  v_settlement_id UUID;
  v_total_applied INTEGER := 0;
  v_allocation_record JSONB;
  v_allocations JSONB := '[]'::JSONB;
BEGIN
  -- Validate
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Settlement amount must be positive';
  END IF;

  IF p_from_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the debtor can settle';
  END IF;

  -- Lock and iterate obligations (oldest first)
  FOR v_rec IN
    SELECT id, original_amount, settled_amount,
           (original_amount - settled_amount) AS remaining
    FROM obligations
    WHERE debtor_id = p_from_user_id
      AND creditor_id = p_to_user_id
      AND status != 'cancelled'
      AND (original_amount - settled_amount) > 0
    ORDER BY created_at ASC
    FOR UPDATE
  LOOP
    v_applied := LEAST(v_rec.remaining, v_remaining_payment);

    -- Update obligation
    UPDATE obligations
    SET settled_amount = settled_amount + v_applied,
        status = CASE
          WHEN settled_amount + v_applied >= original_amount THEN 'settled'
          ELSE 'partially_settled'
        END,
        settled_at = CASE
          WHEN settled_amount + v_applied >= original_amount THEN NOW()
          ELSE settled_at
        END
    WHERE id = v_rec.id;

    -- Track allocation
    v_allocations := v_allocations || jsonb_build_object(
      'obligation_id', v_rec.id,
      'amount', v_applied
    );

    v_remaining_payment := v_remaining_payment - v_applied;
    v_total_applied := v_total_applied + v_applied;

    IF v_remaining_payment = 0 THEN
      EXIT;
    END IF;
  END LOOP;

  -- Reject overpayment
  IF v_remaining_payment > 0 THEN
    RAISE EXCEPTION 'Settlement of ₹% exceeds outstanding debt of ₹%', p_amount, v_total_applied;
  END IF;

  -- Insert settlement record
  INSERT INTO settlements (from_user_id, to_user_id, amount)
  VALUES (p_from_user_id, p_to_user_id, p_amount)
  RETURNING id INTO v_settlement_id;

  -- Insert allocation records
  FOR v_allocation_record IN SELECT * FROM jsonb_array_elements(v_allocations) LOOP
    INSERT INTO settlement_allocations (settlement_id, obligation_id, amount)
    VALUES (
      v_settlement_id,
      (v_allocation_record->>'obligation_id')::UUID,
      (v_allocation_record->>'amount')::INTEGER
    );
  END LOOP;

  RETURN jsonb_build_object(
    'settlement_id', v_settlement_id,
    'total_applied', v_total_applied,
    'allocations', v_allocations
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
