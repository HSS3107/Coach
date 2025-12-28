-- ==============================================================================
-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR TO FIX PERMISSION ERRORS
-- ==============================================================================

-- 1. Enable RLS on all tables (Security Best Practice)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- 2. USERS Table Policies
-- Allow authenticated users to insert their own profile (Critical for Sign Up)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 3. OTHER Tables (Simple ownership check)
-- Goals
CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

-- Logs
CREATE POLICY "Users can manage own logs" ON master_logs
  FOR ALL USING (auth.uid() = user_id);

-- Resources
CREATE POLICY "Users can manage own resources" ON resources
  FOR ALL USING (auth.uid() = user_id);

-- Chats
CREATE POLICY "Users can manage own chats" ON chats
  FOR ALL USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can manage own messages" ON chat_messages
  FOR ALL USING (auth.uid() = user_id);

-- Summaries
CREATE POLICY "Users can manage own summaries" ON summaries
  FOR ALL USING (auth.uid() = user_id);
