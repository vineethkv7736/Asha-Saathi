-- Check Database Schema Script

-- 1. Check if the users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 2. Check the structure of the users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check if email column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'email';

-- 4. Check all columns in users table
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 5. Check sample data (first few rows)
SELECT * FROM public.users LIMIT 5;

-- 6. Check if there are any constraints on the users table
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass; 