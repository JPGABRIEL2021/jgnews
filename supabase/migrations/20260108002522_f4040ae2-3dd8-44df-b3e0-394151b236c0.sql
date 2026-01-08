-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update posts table policies for authenticated write access
DROP POLICY IF EXISTS "Allow public read access" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.posts;

-- Anyone can read posts
CREATE POLICY "Anyone can read posts"
ON public.posts
FOR SELECT
USING (true);

-- Only admins can insert posts
CREATE POLICY "Admins can insert posts"
ON public.posts
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update posts
CREATE POLICY "Admins can update posts"
ON public.posts
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete posts
CREATE POLICY "Admins can delete posts"
ON public.posts
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));