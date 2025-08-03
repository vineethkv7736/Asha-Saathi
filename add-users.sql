-- Add Users Script for BabyAssist AI
-- Run this in your Supabase SQL Editor

-- First, make sure the users table exists and has the correct structure
-- (This should already be done if you ran the main schema)

-- Add new users to the users table
INSERT INTO public.users (name, email, mobile, area) VALUES 
('Niranjan Sabarinath', 'niranjansabarinath1521@gmail.com', '9876543210', 'Kochi District'),
('Priya Nair', 'priya@babyassist.local', '9876543211', 'Ernakulam District'),
('Sunita Sharma', 'sunita@babyassist.local', '9876543212', 'Thrissur District'),
('Lakshmi Devi', 'lakshmi@babyassist.local', '9876543213', 'Kottayam District'),
('Meera Patel', 'meera@babyassist.local', '9876543214', 'Alappuzha District'),
('Anjali Kumar', 'anjali@babyassist.local', '9876543215', 'Pathanamthitta District');

-- Verify the users were added
SELECT id, name, email, mobile, area, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- Note: After adding users to the database, you'll need to create corresponding auth users
-- Go to Authentication → Users → Add User for each email address
-- Or use the Supabase API to create auth users programmatically 