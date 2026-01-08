-- Update the check constraint to include schedule_interval
ALTER TABLE public.news_collection_config 
DROP CONSTRAINT IF EXISTS news_collection_config_type_check;

ALTER TABLE public.news_collection_config 
ADD CONSTRAINT news_collection_config_type_check 
CHECK (type IN ('site', 'topic', 'time_filter', 'schedule_interval'));

-- Insert default schedule interval config
INSERT INTO public.news_collection_config (type, value, is_active)
VALUES ('schedule_interval', '1h', true)
ON CONFLICT DO NOTHING;