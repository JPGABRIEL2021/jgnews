export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  created_at: string;
  is_featured: boolean;
  is_breaking?: boolean;
  author?: string;
}

export const mockPosts: Post[] = [
  {
    id: "0",
    title: "URGENTE: Banco Central anuncia nova taxa de juros em decisão histórica",
    slug: "banco-central-nova-taxa-juros-historica",
    excerpt: "Em reunião extraordinária, o Copom decidiu por unanimidade alterar a Selic, surpreendendo o mercado financeiro.",
    content: `<p>O Banco Central anunciou há poucos minutos uma decisão histórica sobre a taxa básica de juros do país. A mudança, que surpreendeu analistas do mercado, foi decidida por unanimidade pelos membros do Comitê de Política Monetária.</p>`,
    cover_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    category: "Economia",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    is_featured: false,
    is_breaking: true,
    author: "Redação JG News"
  },
  {
    id: "1",
    title: "Governo anuncia pacote de medidas econômicas para impulsionar crescimento em 2025",
    slug: "governo-anuncia-pacote-medidas-economicas-2025",
    excerpt: "Ministro da Fazenda apresenta conjunto de ações que visam acelerar a economia e gerar empregos nos próximos meses.",
    content: `
      <p>O Ministério da Fazenda anunciou nesta quarta-feira um amplo pacote de medidas econômicas que promete transformar o cenário financeiro do país nos próximos anos. As ações incluem incentivos fiscais para pequenas e médias empresas, redução de burocracias e novos programas de crédito.</p>
      
      <h2>Principais pontos do pacote</h2>
      
      <p>Entre as medidas mais impactantes está a <strong>redução de impostos para setores estratégicos</strong>, especialmente tecnologia e energia renovável. O governo estima que essas mudanças podem gerar até 500 mil novos empregos até o final do próximo ano.</p>
      
      <blockquote>"Estamos criando as condições para um crescimento sustentável e inclusivo", afirmou o ministro durante coletiva de imprensa.</blockquote>
      
      <p>Os economistas receberam o anúncio com cautela otimista. Especialistas apontam que a eficácia das medidas dependerá da velocidade de implementação e do cenário internacional.</p>
      
      <h2>Impacto esperado</h2>
      
      <ul>
        <li>Crescimento do PIB projetado de 3,2% para 2025</li>
        <li>Redução da taxa de desemprego para 7%</li>
        <li>Aumento de investimentos estrangeiros</li>
        <li>Fortalecimento da moeda nacional</li>
      </ul>
      
      <p>O mercado financeiro reagiu positivamente ao anúncio, com a bolsa de valores registrando alta de 2,3% no fechamento do pregão.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=800&fit=crop",
    category: "Economia",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    author: "Maria Silva"
  },
  {
    id: "2",
    title: "Seleção Brasileira vence por 3x0 e se classifica para as quartas de final",
    slug: "selecao-brasileira-vence-classifica-quartas",
    excerpt: "Com gols de Vinicius Jr., Rodrygo e Endrick, Brasil domina rival e avança na competição.",
    content: `
      <p>A Seleção Brasileira apresentou futebol de alto nível e goleou seu adversário por 3 a 0, garantindo vaga nas quartas de final da competição. Vinicius Jr. abriu o placar aos 15 minutos do primeiro tempo com um golaço de fora da área.</p>
      
      <h2>Domínio brasileiro</h2>
      
      <p>Desde o início da partida, o Brasil mostrou superioridade técnica e tática. O time comandado pelo técnico conseguiu impor seu ritmo de jogo e não deu chances ao adversário.</p>
      
      <p>Rodrygo ampliou aos 30 minutos, após jogada ensaiada de escanteio. Já nos acréscimos, Endrick, o jovem de apenas 18 anos, marcou seu primeiro gol em competições oficiais pela seleção principal.</p>
      
      <blockquote>"Estou muito feliz por esse momento. Sempre sonhei em vestir essa camisa e marcar gols pelo Brasil", disse Endrick após a partida.</blockquote>
    `,
    cover_image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
    category: "Esportes",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    author: "Carlos Santos"
  },
  {
    id: "3",
    title: "Nova tecnologia de inteligência artificial promete revolucionar diagnósticos médicos",
    slug: "nova-tecnologia-ia-revoluciona-diagnosticos-medicos",
    excerpt: "Sistema desenvolvido por cientistas brasileiros pode detectar doenças com 98% de precisão.",
    content: `
      <p>Pesquisadores da Universidade de São Paulo desenvolveram um sistema de inteligência artificial capaz de analisar exames médicos e identificar doenças com precisão nunca antes vista. A tecnologia já está em fase de testes em hospitais parceiros.</p>
      
      <h2>Como funciona</h2>
      
      <p>O algoritmo foi treinado com milhões de exames e consegue identificar padrões imperceptíveis ao olho humano. Entre as doenças que podem ser detectadas precocemente estão câncer, problemas cardíacos e condições neurológicas.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
    category: "Tecnologia",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    author: "Ana Oliveira"
  },
  {
    id: "4",
    title: "Câmara aprova projeto de lei que amplia licença-paternidade para 30 dias",
    slug: "camara-aprova-licenca-paternidade-30-dias",
    excerpt: "Proposta segue para o Senado e pode beneficiar milhões de trabalhadores brasileiros.",
    content: `
      <p>A Câmara dos Deputados aprovou nesta terça-feira o projeto de lei que estende a licença-paternidade de 5 para 30 dias. A medida, que ainda precisa passar pelo Senado, é considerada um avanço significativo para a igualdade de gênero no ambiente de trabalho.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
    category: "Política",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    author: "Roberto Lima"
  },
  {
    id: "5",
    title: "Festival de música reúne mais de 100 mil pessoas em São Paulo",
    slug: "festival-musica-100-mil-pessoas-sao-paulo",
    excerpt: "Evento contou com apresentações de artistas nacionais e internacionais durante três dias.",
    content: `
      <p>O maior festival de música do país reuniu mais de 100 mil pessoas no Autódromo de Interlagos durante o último fim de semana. O evento contou com shows de artistas consagrados e revelações da música brasileira.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    category: "Entretenimento",
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    author: "Juliana Costa"
  },
  {
    id: "6",
    title: "Tensões aumentam no Oriente Médio após novos conflitos na região",
    slug: "tensoes-aumentam-oriente-medio-conflitos",
    excerpt: "Líderes mundiais pedem cessar-fogo imediato e negociações diplomáticas.",
    content: `
      <p>A comunidade internacional expressou preocupação com a escalada de violência na região do Oriente Médio nas últimas 24 horas. O Conselho de Segurança da ONU convocou reunião emergencial para discutir possíveis medidas.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
    category: "Mundo",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    author: "Fernando Alves"
  },
  {
    id: "7",
    title: "Dólar fecha em queda e atinge menor valor em seis meses",
    slug: "dolar-fecha-queda-menor-valor-seis-meses",
    excerpt: "Moeda americana recuou 1,2% frente ao real após dados positivos da economia brasileira.",
    content: `
      <p>O dólar comercial encerrou o pregão desta quarta-feira cotado a R$ 4,85, o menor patamar desde julho do ano passado. A queda foi impulsionada por indicadores econômicos favoráveis e pelo fluxo positivo de investimentos estrangeiros.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    category: "Economia",
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    author: "Paulo Mendes"
  },
  {
    id: "8",
    title: "Startup brasileira capta R$ 500 milhões em rodada de investimentos",
    slug: "startup-brasileira-capta-500-milhoes-investimentos",
    excerpt: "Fintech de pagamentos digitais atrai atenção de fundos internacionais e planeja expansão.",
    content: `
      <p>Uma startup brasileira do setor de pagamentos digitais anunciou ter captado R$ 500 milhões em sua mais recente rodada de investimentos. O aporte foi liderado por fundos de venture capital dos Estados Unidos e da Europa.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=600&fit=crop",
    category: "Tecnologia",
    created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    author: "Carla Rodrigues"
  },
  {
    id: "9",
    title: "Previsão do tempo: frente fria traz chuvas intensas para o Sudeste",
    slug: "previsao-tempo-frente-fria-chuvas-sudeste",
    excerpt: "Meteorologistas alertam para possibilidade de alagamentos em áreas de risco.",
    content: `
      <p>Uma frente fria que avança pelo litoral brasileiro deve trazer chuvas intensas para toda a região Sudeste nos próximos dias. O Instituto Nacional de Meteorologia emitiu alerta para riscos de alagamentos e deslizamentos.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=600&fit=crop",
    category: "Brasil",
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    author: "Marcelo Torres"
  },
  {
    id: "10",
    title: "Flamengo contrata atacante europeu por valor recorde",
    slug: "flamengo-contrata-atacante-europeu-recorde",
    excerpt: "Jogador chega ao clube carioca como a maior contratação da história do futebol brasileiro.",
    content: `
      <p>O Flamengo oficializou nesta quinta-feira a contratação de um atacante que atuava no futebol europeu. O valor da transferência, estimado em R$ 180 milhões, torna a negociação a maior da história do futebol brasileiro.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=600&fit=crop",
    category: "Esportes",
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    author: "Diego Ferreira"
  }
];

export const getPostBySlug = (slug: string): Post | undefined => {
  return mockPosts.find(post => post.slug === slug);
};

export const getPostsByCategory = (category: string): Post[] => {
  return mockPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
};

export const getFeaturedPosts = (): Post[] => {
  return mockPosts.filter(post => post.is_featured).slice(0, 3);
};

export const getLatestPosts = (limit?: number): Post[] => {
  const sorted = [...mockPosts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
};

export const getBreakingNews = (): Post | null => {
  return mockPosts.find(post => post.is_breaking) || null;
};

export const categories = [
  "Política",
  "Economia",
  "Esportes",
  "Tecnologia",
  "Entretenimento",
  "Mundo",
  "Brasil"
];
