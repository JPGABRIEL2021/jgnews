-- Drop public read policy for news_collection_config
DROP POLICY IF EXISTS "Anyone can read config" ON news_collection_config;

-- Create admin-only read policy
CREATE POLICY "Admins can read config"
ON news_collection_config
FOR SELECT
USING (has_role(auth.uid(), 'admin'));