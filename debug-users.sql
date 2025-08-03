-- Debug Users Script - Check for duplicate emails and data issues

-- 1. Check all users in the database
SELECT id, name, email, mobile, area, created_at 
FROM public.users 
ORDER BY email, created_at;

-- 2. Find duplicate emails
SELECT email, COUNT(*) as count
FROM public.users 
GROUP BY email 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 3. Check for the specific email
SELECT id, name, email, mobile, area, created_at 
FROM public.users 
WHERE email = 'niranjansabarinath1521@gmail.com'
ORDER BY created_at;

-- 4. Check for similar emails (case sensitivity issues)
SELECT id, name, email, mobile, area, created_at 
FROM public.users 
WHERE LOWER(email) = LOWER('niranjansabarinath1521@gmail.com')
ORDER BY created_at;

-- 5. Count total users
SELECT COUNT(*) as total_users FROM public.users;

-- 6. Check for any NULL or empty emails
SELECT id, name, email, mobile, area, created_at 
FROM public.users 
WHERE email IS NULL OR email = '' OR email = 'null'
ORDER BY created_at; 