-- Add category preferences to push subscriptions
ALTER TABLE public.push_subscriptions 
ADD COLUMN categories text[] DEFAULT ARRAY['Política', 'Economia', 'Tecnologia', 'Esportes', 'Cultura', 'Internacional', 'Saúde', 'Ciência'];

-- Create index for faster queries
CREATE INDEX idx_push_subscriptions_categories ON public.push_subscriptions USING GIN(categories);