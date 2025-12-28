-- ==============================================================================
-- FIX NUMERIC PRECISION
-- ==============================================================================

-- Increase precision for height_cm in users table
ALTER TABLE public.users 
ALTER COLUMN height_cm TYPE NUMERIC(10,2);

-- Increase precision for weight columns in goals table
ALTER TABLE public.goals 
ALTER COLUMN start_weight_kg TYPE NUMERIC(10,2);

ALTER TABLE public.goals 
ALTER COLUMN target_weight_kg TYPE NUMERIC(10,2);
