-- PostgreSQL function: create_individual_debt
-- Creates an individual/person-to-person obligation
CREATE OR REPLACE FUNCTION create_individual_debt(
  p_creditor_id UUID,
  p_debtor_id UUID,
  p_description TEXT,
  p_amount INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_debt_id UUID;
  v_obligation_id UUID;
BEGIN
  -- Validate caller is the creditor
  IF p_creditor_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the creditor can create an individual debt';
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Validate debtor is not the creditor
  IF p_creditor_id = p_debtor_id THEN
    RAISE EXCEPTION 'Cannot create debt with yourself';
  END IF;

  -- Create the individual debt record
  INSERT INTO individual_debts (creditor_id, debtor_id, description, amount)
  VALUES (p_creditor_id, p_debtor_id, p_description, p_amount)
  RETURNING id INTO v_debt_id;

  -- Create the corresponding obligation
  INSERT INTO obligations (
    group_id, expense_id, creditor_id, debtor_id,
    original_amount, source, source_reference
  ) VALUES (
    NULL, NULL, p_creditor_id, p_debtor_id,
    p_amount, 'individual_debt', v_debt_id
  )
  RETURNING id INTO v_obligation_id;

  RETURN jsonb_build_object(
    'debt_id', v_debt_id,
    'obligation_id', v_obligation_id,
    'status', 'created'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
