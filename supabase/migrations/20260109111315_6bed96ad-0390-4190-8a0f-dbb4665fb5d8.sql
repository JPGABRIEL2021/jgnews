-- Add is_sensitive column to posts table for AdSense compliance
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT false NOT NULL;