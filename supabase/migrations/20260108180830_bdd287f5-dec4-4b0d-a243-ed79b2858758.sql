-- Fix conflicting RLS policies on posts table
-- Drop the permissive policies that allow any authenticated user to modify posts
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;

-- The following admin-only and public read policies should remain:
-- "Anyone can read posts" (SELECT, USING true)
-- "Admins can insert posts" (INSERT, WITH CHECK has_role(...))
-- "Admins can update posts" (UPDATE, USING has_role(...))
-- "Admins can delete posts" (DELETE, USING has_role(...))