-- Individual debts table (person-to-person, outside groups)
CREATE TABLE individual_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creditor_id UUID NOT NULL REFERENCES profiles(id),
  debtor_id UUID NOT NULL REFERENCES profiles(id),
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE individual_debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view individual debts"
  ON individual_debts FOR SELECT
  USING (auth.uid() = creditor_id OR auth.uid() = debtor_id);

CREATE POLICY "Creditor can create individual debts"
  ON individual_debts FOR INSERT
  WITH CHECK (auth.uid() = creditor_id);
