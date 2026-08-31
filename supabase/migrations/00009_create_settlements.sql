-- Settlements table
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES profiles(id),
  to_user_id UUID NOT NULL REFERENCES profiles(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view settlements"
  ON settlements FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Settlement allocations table
CREATE TABLE settlement_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  obligation_id UUID NOT NULL REFERENCES obligations(id),
  amount INTEGER NOT NULL CHECK (amount > 0)
);

ALTER TABLE settlement_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view allocations"
  ON settlement_allocations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM settlements s
      WHERE s.id = settlement_allocations.settlement_id
      AND (s.from_user_id = auth.uid() OR s.to_user_id = auth.uid())
    )
  );
