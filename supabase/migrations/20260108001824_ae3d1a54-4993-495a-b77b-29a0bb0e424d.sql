-- Create posts table for news articles
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_category ON public.posts(category);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_is_featured ON public.posts(is_featured) WHERE is_featured = true;
CREATE INDEX idx_posts_is_breaking ON public.posts(is_breaking) WHERE is_breaking = true;

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (news portal is public)
CREATE POLICY "Posts are viewable by everyone"
ON public.posts
FOR SELECT
USING (true);

-- Create policy for authenticated users to manage posts (for admin panel)
CREATE POLICY "Authenticated users can insert posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete posts"
ON public.posts
FOR DELETE
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Insert sample data
INSERT INTO public.posts (title, slug, excerpt, content, cover_image, category, author, is_featured, is_breaking) VALUES
('URGENTE: Banco Central anuncia nova taxa de juros em decisão histórica', 'banco-central-nova-taxa-juros-historica', 'Em reunião extraordinária, o Copom decidiu por unanimidade alterar a Selic, surpreendendo o mercado financeiro.', '<p>O Banco Central anunciou há poucos minutos uma decisão histórica sobre a taxa básica de juros do país. A mudança, que surpreendeu analistas do mercado, foi decidida por unanimidade pelos membros do Comitê de Política Monetária.</p><h2>Impacto no mercado</h2><p>Os economistas apontam que a decisão terá reflexos imediatos na economia brasileira, afetando desde investimentos até o crédito ao consumidor.</p>', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', 'Economia', 'Redação JG News', false, true),

('Governo anuncia pacote de medidas econômicas para impulsionar crescimento em 2025', 'governo-anuncia-pacote-medidas-economicas-2025', 'Ministro da Fazenda apresenta conjunto de ações que visam acelerar a economia e gerar empregos nos próximos meses.', '<p>O Ministério da Fazenda anunciou nesta quarta-feira um amplo pacote de medidas econômicas que promete transformar o cenário financeiro do país nos próximos anos.</p><h2>Principais pontos do pacote</h2><p>Entre as medidas mais impactantes está a <strong>redução de impostos para setores estratégicos</strong>, especialmente tecnologia e energia renovável.</p><blockquote>"Estamos criando as condições para um crescimento sustentável e inclusivo", afirmou o ministro.</blockquote><ul><li>Crescimento do PIB projetado de 3,2% para 2025</li><li>Redução da taxa de desemprego para 7%</li><li>Aumento de investimentos estrangeiros</li></ul>', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=800&fit=crop', 'Economia', 'Maria Silva', true, false),

('Seleção Brasileira vence por 3x0 e se classifica para as quartas de final', 'selecao-brasileira-vence-classifica-quartas', 'Com gols de Vinicius Jr., Rodrygo e Endrick, Brasil domina rival e avança na competição.', '<p>A Seleção Brasileira apresentou futebol de alto nível e goleou seu adversário por 3 a 0, garantindo vaga nas quartas de final da competição.</p><h2>Domínio brasileiro</h2><p>Desde o início da partida, o Brasil mostrou superioridade técnica e tática.</p><blockquote>"Estou muito feliz por esse momento", disse Endrick após a partida.</blockquote>', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop', 'Esportes', 'Carlos Santos', true, false),

('Nova tecnologia de inteligência artificial promete revolucionar diagnósticos médicos', 'nova-tecnologia-ia-revoluciona-diagnosticos-medicos', 'Sistema desenvolvido por cientistas brasileiros pode detectar doenças com 98% de precisão.', '<p>Pesquisadores da Universidade de São Paulo desenvolveram um sistema de inteligência artificial capaz de analisar exames médicos e identificar doenças com precisão nunca antes vista.</p><h2>Como funciona</h2><p>O algoritmo foi treinado com milhões de exames e consegue identificar padrões imperceptíveis ao olho humano.</p>', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop', 'Tecnologia', 'Ana Oliveira', true, false),

('Câmara aprova projeto de lei que amplia licença-paternidade para 30 dias', 'camara-aprova-licenca-paternidade-30-dias', 'Proposta segue para o Senado e pode beneficiar milhões de trabalhadores brasileiros.', '<p>A Câmara dos Deputados aprovou nesta terça-feira o projeto de lei que estende a licença-paternidade de 5 para 30 dias.</p>', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop', 'Política', 'Roberto Lima', false, false),

('Festival de música reúne mais de 100 mil pessoas em São Paulo', 'festival-musica-100-mil-pessoas-sao-paulo', 'Evento contou com apresentações de artistas nacionais e internacionais durante três dias.', '<p>O maior festival de música do país reuniu mais de 100 mil pessoas no Autódromo de Interlagos durante o último fim de semana.</p>', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop', 'Entretenimento', 'Juliana Costa', false, false),

('Tensões aumentam no Oriente Médio após novos conflitos na região', 'tensoes-aumentam-oriente-medio-conflitos', 'Líderes mundiais pedem cessar-fogo imediato e negociações diplomáticas.', '<p>A comunidade internacional expressou preocupação com a escalada de violência na região do Oriente Médio nas últimas 24 horas.</p>', 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop', 'Mundo', 'Fernando Alves', false, false),

('Dólar fecha em queda e atinge menor valor em seis meses', 'dolar-fecha-queda-menor-valor-seis-meses', 'Moeda americana recuou 1,2% frente ao real após dados positivos da economia brasileira.', '<p>O dólar comercial encerrou o pregão desta quarta-feira cotado a R$ 4,85, o menor patamar desde julho do ano passado.</p>', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', 'Economia', 'Paulo Mendes', false, false),

('Startup brasileira capta R$ 500 milhões em rodada de investimentos', 'startup-brasileira-capta-500-milhoes-investimentos', 'Fintech de pagamentos digitais atrai atenção de fundos internacionais e planeja expansão.', '<p>Uma startup brasileira do setor de pagamentos digitais anunciou ter captado R$ 500 milhões em sua mais recente rodada de investimentos.</p>', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=600&fit=crop', 'Tecnologia', 'Carla Rodrigues', false, false),

('Flamengo contrata atacante europeu por valor recorde', 'flamengo-contrata-atacante-europeu-recorde', 'Jogador chega ao clube carioca como a maior contratação da história do futebol brasileiro.', '<p>O Flamengo oficializou nesta quinta-feira a contratação de um atacante que atuava no futebol europeu.</p>', 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=600&fit=crop', 'Esportes', 'Diego Ferreira', false, false);