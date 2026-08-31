-- Obligations table: the core financial record
CREATE TABLE obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  expense_id UUID REFERENCES expenses(id),
  creditor_id UUID NOT NULL REFERENCES profiles(id),
  debtor_id UUID NOT NULL REFERENCES profiles(id),
  original_amount INTEGER NOT NULL CHECK (original_amount > 0),
  settled_amount INTEGER NOT NULL DEFAULT 0 CHECK (settled_amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partially_settled', 'settled', 'cancelled')),
  source TEXT NOT NULL CHECK (source IN ('group_expense', 'individual_debt', 'reversal')),
  source_reference UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  CHECK (settled_amount <= original_amount)
);

ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own obligations"
  ON obligations FOR SELECT
  USING (auth.uid() = creditor_id OR auth.uid() = debtor_id);

-- All mutations via PostgreSQL functions only
