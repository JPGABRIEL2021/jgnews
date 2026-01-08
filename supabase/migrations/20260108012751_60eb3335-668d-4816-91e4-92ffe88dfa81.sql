-- Add scheduled_at column for post scheduling
ALTER TABLE public.posts 
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient querying of scheduled posts
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at) WHERE scheduled_at IS NOT NULL;