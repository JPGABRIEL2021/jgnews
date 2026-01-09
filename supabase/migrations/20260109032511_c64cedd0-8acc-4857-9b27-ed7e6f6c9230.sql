-- Add unique constraint on slug column
ALTER TABLE public.posts ADD CONSTRAINT posts_slug_unique UNIQUE (slug);