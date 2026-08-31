-- Group invitations table
CREATE TABLE group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id),
  invitee_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviter can view sent invitations"
  ON group_invitations FOR SELECT
  USING (inviter_id = auth.uid());

CREATE POLICY "Invitee can view received invitations"
  ON group_invitations FOR SELECT
  USING (
    invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can create invitations"
  ON group_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_invitations.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );
