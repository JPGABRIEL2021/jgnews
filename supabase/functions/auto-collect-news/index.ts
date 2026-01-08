import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("🚀 Starting automatic news collection...");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create log entry
  const { data: logEntry, error: logError } = await supabase
    .from("news_collection_logs")
    .insert({ status: "running" })
    .select()
    .single();

  if (logError) {
    console.error("Failed to create log entry:", logError);
  }

  const logId = logEntry?.id;

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      await updateLog(supabase, logId, "error", { error_message: "Firecrawl não configurado" });
      return new Response(
        JSON.stringify({ error: "Firecrawl não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      await updateLog(supabase, logId, "error", { error_message: "OpenAI não configurado" });
      return new Response(
        JSON.stringify({ error: "OpenAI não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active sites from config
    const { data: sitesConfig } = await supabase
      .from("news_collection_config")
      .select("value")
      .eq("type", "site")
      .eq("is_active", true);

    const sites = sitesConfig?.map(s => s.value) || ["g1.globo.com", "folha.uol.com.br", "estadao.com.br"];

    // Get active topics from config
    const { data: topicsConfig } = await supabase
      .from("news_collection_config")
      .select("value")
      .eq("type", "topic")
      .eq("is_active", true);

    const topics = topicsConfig?.map(t => t.value) || ["últimas notícias Brasil"];

    // Pick a random topic to search
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const siteFilters = sites.map(s => `site:${s}`).join(" OR ");
    const searchQuery = `(${siteFilters}) ${randomTopic}`;

    console.log(`📰 Searching: ${searchQuery}`);

    // Update log with search query
    await supabase
      .from("news_collection_logs")
      .update({ search_query: searchQuery })
      .eq("id", logId);

    // Search for news using Firecrawl
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
        lang: "pt",
        country: "BR",
        tbs: "qdr:d",
        scrapeOptions: {
          formats: ["markdown"],
          includeTags: ["img", "meta"]
        }
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error("Firecrawl API error:", searchData);
      await updateLog(supabase, logId, "error", { error_message: searchData.error || "Erro ao buscar notícias" });
      return new Response(
        JSON.stringify({ error: searchData.error || "Erro ao buscar notícias" }),
        { status: searchResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = searchData.data || [];
    console.log(`📋 Found ${results.length} news articles`);

    if (results.length === 0) {
      await updateLog(supabase, logId, "success", {
        articles_found: 0,
        articles_collected: 0,
        duration_seconds: ((Date.now() - startTime) / 1000).toFixed(2)
      });
      return new Response(
        JSON.stringify({ success: true, message: "Nenhuma notícia encontrada", collected: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing post titles to avoid duplicates
    const { data: existingPosts } = await supabase
      .from("posts")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(100);

    const existingTitles = new Set(
      (existingPosts || []).map(p => p.title.toLowerCase().trim())
    );

    let collectedCount = 0;
    const collectedPosts: any[] = [];

    // Process each news result
    for (const item of results.slice(0, 3)) {
      try {
        const title = item.title || item.metadata?.title;
        const description = item.description || item.metadata?.description || "";
        const markdown = item.markdown || "";
        const url = item.url;
        
        // Extract original image from metadata
        const ogImage = item.metadata?.ogImage || item.metadata?.["og:image"];
        const twitterImage = item.metadata?.["twitter:image"];
        const sourceImage = item.metadata?.sourceURL ? `${new URL(item.metadata.sourceURL).origin}/favicon.ico` : null;
        
        // Try to extract image from markdown content
        const markdownImageMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s\)]+\.(jpg|jpeg|png|webp|gif)[^\s\)]*)\)/i);
        const markdownImage = markdownImageMatch?.[1];
        
        // Priority: og:image > twitter:image > markdown image > fallback
        const originalImage = ogImage || twitterImage || markdownImage || null;

        if (!title || !markdown) {
          console.log("⏭️ Skipping item without title or content");
          continue;
        }

        // Check for duplicates
        const normalizedTitle = title.toLowerCase().trim();
        if (existingTitles.has(normalizedTitle)) {
          console.log(`⏭️ Skipping duplicate: ${title.slice(0, 50)}...`);
          continue;
        }

        console.log(`🤖 Generating article from: ${title.slice(0, 60)}...`);
        console.log(`🖼️ Original image found: ${originalImage ? originalImage.slice(0, 80) + '...' : 'None'}`);

        // Generate article using AI
        const article = await generateArticle(
          OPENAI_API_KEY,
          title,
          description,
          markdown,
          url
        );

        if (!article) {
          console.log("⚠️ Failed to generate article");
          continue;
        }

        // Determine category based on content
        const category = detectCategory(article.content, title);

        // Use original image or fallback to Unsplash
        const coverImage = originalImage || `https://source.unsplash.com/800x600/?${encodeURIComponent(title.split(" ").slice(0, 3).join(","))},news`;

        // Save to database
        const { data: post, error } = await supabase
          .from("posts")
          .insert({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            cover_image: coverImage,
            category: category,
            author: article.author,
            is_featured: false,
            is_breaking: article.isUrgent,
          })
          .select()
          .single();

        if (error) {
          console.error("❌ Error saving post:", error);
          continue;
        }

        console.log(`✅ Saved: ${article.title.slice(0, 50)}...`);
        collectedCount++;
        collectedPosts.push({
          id: post.id,
          title: post.title,
          category: post.category,
          is_breaking: post.is_breaking
        });
        existingTitles.add(normalizedTitle);

        // Small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.error("❌ Error processing item:", err);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✨ Completed! Collected ${collectedCount} articles in ${duration}s`);

    // Update log with success
    await updateLog(supabase, logId, "success", {
      articles_found: results.length,
      articles_collected: collectedCount,
      duration_seconds: parseFloat(duration),
      created_posts: collectedPosts
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Coletadas ${collectedCount} notícias`,
        collected: collectedCount,
        posts: collectedPosts,
        duration: `${duration}s`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    await updateLog(supabase, logId, "error", { error_message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateLog(
  supabase: any,
  logId: string | undefined,
  status: string,
  data: Record<string, any>
) {
  if (!logId) return;
  
  try {
    await supabase
      .from("news_collection_logs")
      .update({
        status,
        completed_at: new Date().toISOString(),
        ...data
      })
      .eq("id", logId);
  } catch (err) {
    console.error("Failed to update log:", err);
  }
}

async function generateArticle(
  apiKey: string,
  originalTitle: string,
  description: string,
  markdown: string,
  sourceUrl: string
): Promise<{
  title: string;
  excerpt: string;
  content: string;
  author: string;
  slug: string;
  isUrgent: boolean;
} | null> {
  const systemPrompt = `Você é um jornalista sênior. Reescreva a notícia abaixo em formato jornalístico profissional.

REGRAS:
• Reescreva com suas próprias palavras, mantendo os fatos
• Linguagem clara e acessível
• Parágrafos curtos
• Sem opinião ou sensacionalismo
• NÃO INCLUA NENHUM LINK ou URL no texto
• NÃO mencione fontes externas ou sites de onde a notícia foi obtida
• NÃO adicione seções de "Informações relevantes", "Saiba mais", "Leia também" ou similares
• Apenas o conteúdo da notícia, sem referências externas

FORMATO DE RESPOSTA:
---URGENTE---
[SIM se for notícia urgente/importante, caso contrário NÃO]

---TITULO---
[Título informativo e direto]

---SUBTITULO---
[Subtítulo explicativo]

---AUTOR---
[Nome fictício de repórter]

---CONTEUDO---
[Conteúdo em HTML com <p>, <h3>, <ul><li> - SEM LINKS]`;

  const userPrompt = `TÍTULO ORIGINAL: ${originalTitle}

DESCRIÇÃO: ${description}

CONTEÚDO:
${markdown.slice(0, 4000)}

FONTE: ${sourceUrl}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return parseGeneratedContent(content);
  } catch (err) {
    console.error("Error calling OpenAI:", err);
    return null;
  }
}

function parseGeneratedContent(content: string): {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  slug: string;
  isUrgent: boolean;
} {
  const urgentMatch = content.match(/---URGENTE---\s*([\s\S]*?)(?=---TITULO---|$)/);
  const titleMatch = content.match(/---TITULO---\s*([\s\S]*?)(?=---SUBTITULO---|$)/);
  const subtitleMatch = content.match(/---SUBTITULO---\s*([\s\S]*?)(?=---AUTOR---|$)/);
  const authorMatch = content.match(/---AUTOR---\s*([\s\S]*?)(?=---CONTEUDO---|$)/);
  const contentMatch = content.match(/---CONTEUDO---\s*([\s\S]*?)$/);

  const urgentText = urgentMatch?.[1]?.trim().toUpperCase() || "";
  const isUrgent = urgentText === "SIM" || urgentText.includes("SIM");

  const title = titleMatch?.[1]?.trim() || "Notícia sem título";
  const excerpt = subtitleMatch?.[1]?.trim() || "";
  const author = authorMatch?.[1]?.trim() || "Redação IA";
  let htmlContent = contentMatch?.[1]?.trim() || content;
  
  // Remove any remaining links from the content
  htmlContent = htmlContent
    .replace(/<a[^>]*>([^<]*)<\/a>/gi, '$1') // Remove <a> tags keeping text
    .replace(/https?:\/\/[^\s<>"']+/gi, '') // Remove raw URLs
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove markdown links

  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);

  return {
    title,
    excerpt,
    content: htmlContent,
    author,
    slug: `${slug}-${Date.now()}`,
    isUrgent,
  };
}

function detectCategory(content: string, title: string): string {
  const text = (title + " " + content).toLowerCase();

  if (/economia|dólar|bolsa|pib|inflação|juros|selic|mercado|banco|emprego/.test(text)) {
    return "Economia";
  }
  if (/política|governo|congresso|senado|câmara|lula|bolsonaro|eleição|ministro/.test(text)) {
    return "Política";
  }
  if (/tecnologia|app|aplicativo|internet|google|apple|microsoft|ia|inteligência artificial/.test(text)) {
    return "Tecnologia";
  }
  if (/esporte|futebol|time|campeonato|jogador|gol|copa|flamengo|corinthians|palmeiras/.test(text)) {
    return "Esportes";
  }
  if (/saúde|hospital|médico|vacina|doença|tratamento|sus/.test(text)) {
    return "Saúde";
  }
  if (/educação|escola|universidade|ensino|professor|estudante|enem/.test(text)) {
    return "Educação";
  }

  return "Brasil";
}
