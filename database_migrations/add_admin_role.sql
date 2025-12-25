-- Add is_admin column to users table
ALTER TABLE users
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- INSTRUCTIONS TO SET YOURSELF AS ADMIN:
-- 1. Run the ALTER TABLE statement above in Supabase SQL Editor
-- 2. Then run ONE of the following UPDATE statements:

-- Option A: Set admin by email (RECOMMENDED - replace with your email)
-- UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';

-- Option B: Make the first registered user an admin
-- UPDATE users SET is_admin = TRUE WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- Option C: View all users and their IDs to choose which to make admin
-- SELECT id, email, name, created_at FROM users ORDER BY created_at;
-- Then run: UPDATE users SET is_admin = TRUE WHERE id = 'paste-user-id-here';
