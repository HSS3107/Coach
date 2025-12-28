-- FIX SCRIPT: Relax constraints on users table
-- Run this in Supabase SQL Editor

-- 1. Make google_sub optional (since we are using Email auth)
ALTER TABLE users ALTER COLUMN google_sub DROP NOT NULL;

-- 2. Remove the unique constraint on google_sub if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_google_sub_key;

-- 3. Ensure RLS policies are applied (re-run of previous policy just in case)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 4. Grant usage on implicit sequence if needed (usually auto-handled but good for safety)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
