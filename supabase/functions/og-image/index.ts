import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = "https://jgnews.com.br";
const SITE_NAME = "JG News";
const DEFAULT_IMAGE = `${SITE_URL}/pwa-512x512.png`;
const DEFAULT_DESCRIPTION = "Portal de notícias com as últimas atualizações em política, economia, esportes, tecnologia e entretenimento.";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    console.log('OG meta request for slug:', slug);

    if (!slug) {
      console.log('No slug provided, returning default meta tags');
      return generateHtmlResponse({
        title: `${SITE_NAME} - Portal de Notícias`,
        description: DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        url: SITE_URL,
        type: 'website',
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the post by slug
    const { data: post, error } = await supabase
      .from('posts')
      .select('title, excerpt, cover_image, category, author, created_at, updated_at')
      .eq('slug', slug)
      .single();

    if (error || !post) {
      console.log('Post not found for slug:', slug, error?.message);
      return generateHtmlResponse({
        title: `Artigo não encontrado | ${SITE_NAME}`,
        description: DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        url: `${SITE_URL}/artigo/${slug}`,
        type: 'article',
      });
    }

    console.log('Found post:', post.title);

    // Ensure image URL is absolute
    const imageUrl = post.cover_image?.startsWith('http') 
      ? post.cover_image 
      : `${SITE_URL}${post.cover_image}`;

    // Truncate description to 160 chars
    const description = post.excerpt?.length > 160 
      ? post.excerpt.substring(0, 157) + '...' 
      : post.excerpt || DEFAULT_DESCRIPTION;

    return generateHtmlResponse({
      title: `${post.title} | ${SITE_NAME}`,
      description,
      image: imageUrl,
      url: `${SITE_URL}/artigo/${slug}`,
      type: 'article',
      article: {
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
        author: post.author || 'Redação JG News',
        category: post.category,
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in og-image function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

interface MetaData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  article?: {
    publishedTime: string;
    modifiedTime: string;
    author: string;
    category: string;
  };
}

function generateHtmlResponse(meta: MetaData): Response {
  const articleTags = meta.article ? `
    <meta property="article:published_time" content="${meta.article.publishedTime}" />
    <meta property="article:modified_time" content="${meta.article.modifiedTime}" />
    <meta property="article:author" content="${meta.article.author}" />
    <meta property="article:section" content="${meta.article.category}" />
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:url" content="${meta.url}" />
  <meta property="og:locale" content="pt_BR" />
  ${articleTags}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${meta.image}" />
  <meta name="twitter:image:alt" content="${escapeHtml(meta.title)}" />
  
  <!-- Redirect to actual page -->
  <meta http-equiv="refresh" content="0;url=${meta.url}" />
  <link rel="canonical" href="${meta.url}" />
</head>
<body>
  <p>Redirecionando para <a href="${meta.url}">${escapeHtml(meta.title)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
