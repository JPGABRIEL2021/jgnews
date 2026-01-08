-- Drop the old check constraint and create a new one that includes time_filter
ALTER TABLE public.news_collection_config DROP CONSTRAINT IF EXISTS news_collection_config_type_check;

ALTER TABLE public.news_collection_config ADD CONSTRAINT news_collection_config_type_check 
CHECK (type IN ('site', 'topic', 'time_filter'));