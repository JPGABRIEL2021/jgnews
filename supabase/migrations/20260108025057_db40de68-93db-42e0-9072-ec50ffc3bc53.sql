-- Table for collection configuration (sites and topics)
CREATE TABLE public.news_collection_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('site', 'topic')),
  value text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_collection_config ENABLE ROW LEVEL SECURITY;

-- RLS policies - Anyone can read, admins can modify
CREATE POLICY "Anyone can read config" ON public.news_collection_config FOR SELECT USING (true);
CREATE POLICY "Admins can insert config" ON public.news_collection_config FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update config" ON public.news_collection_config FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete config" ON public.news_collection_config FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Table for collection logs
CREATE TABLE public.news_collection_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
  search_query text,
  articles_found integer DEFAULT 0,
  articles_collected integer DEFAULT 0,
  error_message text,
  duration_seconds numeric,
  created_posts jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.news_collection_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies - Anyone can read, service role can insert/update
CREATE POLICY "Anyone can read logs" ON public.news_collection_logs FOR SELECT USING (true);
CREATE POLICY "Service role can insert logs" ON public.news_collection_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update logs" ON public.news_collection_logs FOR UPDATE USING (true);

-- Enable realtime for logs table (for notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.news_collection_logs;

-- Insert default sites
INSERT INTO public.news_collection_config (type, value) VALUES
  ('site', 'g1.globo.com'),
  ('site', 'folha.uol.com.br'),
  ('site', 'estadao.com.br');

-- Insert default topics
INSERT INTO public.news_collection_config (type, value) VALUES
  ('topic', 'últimas notícias Brasil'),
  ('topic', 'economia brasileira'),
  ('topic', 'política nacional'),
  ('topic', 'tecnologia'),
  ('topic', 'esportes');

-- Trigger for updated_at
CREATE TRIGGER update_news_collection_config_updated_at
BEFORE UPDATE ON public.news_collection_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();