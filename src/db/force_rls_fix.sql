-- ==============================================================================
-- FORCE FIX RLS: RESET ALL POLICIES
-- ==============================================================================

-- 1. Drop existing policies on users to start fresh
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for own user" ON users;

-- 2. Enable RLS (just in case)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Create SIMPLE, PERMISSIVE policies for Authenticated Users
-- READ: Allow users to see their own row
CREATE POLICY "Allow users to view own profile" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- INSERT: Allow users to create their own row
CREATE POLICY "Allow users to insert own profile" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- UPDATE: Allow users to update their own row
CREATE POLICY "Allow users to update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 4. GRANT BASIC PERMISSIONS
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
-- Sequence grant removed as ID is UUID
