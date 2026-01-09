-- Add sources column to posts table for reference sources
ALTER TABLE public.posts 
ADD COLUMN sources jsonb DEFAULT '[]'::jsonb;

-- Add comment to explain the column structure
COMMENT ON COLUMN public.posts.sources IS 'Array of reference sources with name and url: [{name: string, url: string}]';