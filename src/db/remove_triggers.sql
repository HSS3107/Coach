-- ==============================================================================
-- DEBUG & FIX: DROP CONFLICTING TRIGGERS
-- ==============================================================================

-- A common cause of "Database error saving new user" is a pre-existing Trigger
-- on auth.users (often from a Starter Kit) that tries to insert into public.users
-- but fails because it doesn't provide the 'email' column (which is required in our schema).

-- 1. Drop the common trigger 'on_auth_user_created' if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function that the trigger calls
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Also check for other common names
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user();

-- 4. Just in case, ensure we didn't leave any bad constraints
ALTER TABLE users ALTER COLUMN google_sub DROP NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_google_sub_key;

-- 5. Final check: Ensure we have permissions
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO postgres;
