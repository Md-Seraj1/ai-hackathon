-- Update 1
-- Allow authenticated users to insert their own try-on sessions
CREATE POLICY "Users can insert own tryon sessions" ON tryon_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own tryon sessions" ON tryon_sessions
  FOR SELECT USING (auth.uid() = user_id);
