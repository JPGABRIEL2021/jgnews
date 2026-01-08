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

  try {
    const { topic, category } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Streaming news generation for topic: ${topic}`);

    const systemPrompt = `Você é um jornalista sênior de um grande portal de notícias nacional, com padrão editorial semelhante ao Globo.com.

Seu compromisso é com:
- Clareza
- Neutralidade
- Precisão
- Serviço ao leitor

REGRAS:
• Utilize apenas as informações fornecidas
• Não crie dados, números ou declarações
• Linguagem acessível ao público brasileiro
• Parágrafos curtos e bem estruturados
• Nada de opinião ou sensacionalismo

═══════════════════════════════════════
ANÁLISE DE URGÊNCIA
═══════════════════════════════════════

Analise se o tema configura uma NOTÍCIA URGENTE.

Critérios para marcação como URGENTE:
• Impacto nacional direto na população
• Decisão oficial de governo, Judiciário ou órgãos reguladores
• Alteração significativa de preços, tarifas ou políticas públicas
• Eventos de segurança pública, desastres ou emergências
• Decisões econômicas que afetem o bolso do cidadão

Se o tema for urgente, indique no campo ---URGENTE--- abaixo.

═══════════════════════════════════════
SEO JORNALÍSTICO
═══════════════════════════════════════

Aplique as melhores práticas de SEO jornalístico:
• Palavras-chave naturais no título e primeiro parágrafo
• Títulos claros e informativos (evite ambiguidade)
• Linguagem humana e fluida (não robótica)
• ZERO clickbait - nunca use títulos vagos ou sensacionalistas
• Responda "O quê?" no título e "Por que importa?" no subtítulo
• Use sinônimos e variações das palavras-chave ao longo do texto

FORMATO DE RESPOSTA:
Responda em formato estruturado com marcadores claros:

---URGENTE---
[SIM ou NÃO]

---TITULO---
[Título informativo, direto, com foco no impacto e palavra-chave principal]

---SUBTITULO---
[Subtítulo que explica rapidamente o contexto e a relevância]

---AUTOR---
[Nome do Repórter]

---CONTEUDO---
[Conteúdo completo em HTML com parágrafos <p>, subtítulos <h3>, listas <ul><li>]

ESTRUTURA DO CONTEÚDO:
1. LEAD - o que aconteceu, onde, quando e por quê
2. CORPO - contexto, causas e consequências
3. IMPACTO - como afeta o cidadão
4. CONTEXTO AMPLIADO - relação com economia/política/sociedade`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Escreva uma notícia jornalística completa sobre: ${topic}` }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a TransformStream to process the SSE data
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullContent = "";
    
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              // Parse the full content and save to database
              try {
                const parsed = parseGeneratedContent(fullContent);
                const post = await savePost(parsed, category, topic);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", post })}\n\n`));
              } catch (err) {
                console.error("Error saving post:", err);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Failed to save" })}\n\n`));
              }
              continue;
            }
            
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "delta", content })}\n\n`));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      },
    });

    const stream = aiResponse.body?.pipeThrough(transformStream);

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
  const htmlContent = contentMatch?.[1]?.trim() || content;

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

async function savePost(
  parsed: { title: string; excerpt: string; content: string; author: string; slug: string; isUrgent: boolean },
  category: string,
  topic: string
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const imageKeywords = encodeURIComponent(topic.split(" ").slice(0, 3).join(","));
  const coverImage = `https://source.unsplash.com/800x600/?${imageKeywords},news`;

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      cover_image: coverImage,
      category: category || "Geral",
      author: parsed.author,
      is_featured: false,
      is_breaking: parsed.isUrgent,
    })
    .select()
    .single();

  if (error) throw error;
  return post;
}
