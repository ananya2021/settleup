-- Wishlist items table (personal or group wishlists)
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  group_id UUID REFERENCES groups(id),
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER CHECK (amount > 0),
  claimed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist items and group wishlist items
CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      group_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = wishlist_items.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  );

-- Users can create their own wishlist items
CREATE POLICY "Users can create own wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlist items
CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  USING (auth.uid() = user_id);
