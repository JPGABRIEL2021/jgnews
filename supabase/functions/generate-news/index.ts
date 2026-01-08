import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schemas
const GenerateNewsSchema = z.object({
  topic: z.string()
    .min(3, "Topic must be at least 3 characters")
    .max(500, "Topic must be less than 500 characters")
    .regex(/^[\p{L}\p{N}\s,.:!?'"()-]+$/u, "Topic contains invalid characters"),
  category: z.string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must be less than 50 characters")
    .regex(/^[\p{L}\p{N}\s]+$/u, "Category contains invalid characters")
    .optional()
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Auth helper function
async function authenticateAdmin(req: Request): Promise<{ error?: Response; userId?: string }> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized - Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
  
  if (claimsError || !claims?.claims) {
    console.error("JWT verification failed:", claimsError);
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    };
  }

  const userId = claims.claims.sub as string;
  
  // Check admin role using service role key
  const supabaseService = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: hasRole, error: roleError } = await supabaseService.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  });

  if (roleError || !hasRole) {
    console.error("Admin check failed:", roleError);
    return {
      error: new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    };
  }

  return { userId };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate admin user
  const auth = await authenticateAdmin(req);
  if (auth.error) {
    return auth.error;
  }

  console.log(`🔐 Admin authenticated: ${auth.userId}`);

  try {
    const body = await req.json();
    
    // Validate input with zod
    const validated = GenerateNewsSchema.safeParse(body);
    if (!validated.success) {
      console.error("Input validation failed:", validated.error.issues);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validated.error.issues.map(i => i.message) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { topic, category } = validated.data;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating news for topic: ${topic}`);

    // Generate news content using OpenAI ChatGPT
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um jornalista sênior de um grande portal de notícias nacional, com padrão editorial semelhante ao Globo.com.

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

ESTRUTURA OBRIGATÓRIA DA MATÉRIA:

1. LEAD - Responde: o que aconteceu, onde, quando e por quê
2. CORPO DA MATÉRIA - Desenvolva o tema com contexto histórico, explique causas e consequências, traga dados relevantes
3. IMPACTO PARA O LEITOR - Como isso afeta o dia a dia do cidadão comum
4. CONTEXTO AMPLIADO - Relacione com economia, política ou sociedade, se aplicável

FINALIZE com tom informativo e equilibrado, como em uma reportagem publicada na home de um grande portal.

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem código):
{
  "title": "Título informativo, direto, com foco no impacto (máximo 100 caracteres)",
  "excerpt": "Subtítulo que explica rapidamente o contexto e a relevância (máximo 200 caracteres)",
  "content": "Conteúdo completo em HTML com parágrafos <p>, subtítulos <h3>, listas <ul><li>, citações <blockquote>. Siga a estrutura obrigatória acima. Mínimo 5 parágrafos.",
  "slug": "slug-da-noticia-em-kebab-case",
  "author": "Nome do Repórter"
}`
          },
          {
            role: "user",
            content: `Escreva uma notícia jornalística completa sobre: ${topic}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: "API key inválida. Verifique sua chave OpenAI." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao gerar conteúdo com ChatGPT" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Resposta do ChatGPT vazia" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("ChatGPT response received, parsing...");

    // Parse the JSON response
    let newsData;
    try {
      // Clean up the response if it has markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      newsData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Erro ao processar resposta do ChatGPT" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a placeholder image URL (using Unsplash for free images)
    const imageKeywords = encodeURIComponent(topic.split(" ").slice(0, 3).join(","));
    const coverImage = `https://source.unsplash.com/800x600/?${imageKeywords},news`;

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ensure unique slug
    const timestamp = Date.now();
    const uniqueSlug = `${newsData.slug || "noticia"}-${timestamp}`;

    // Insert into posts table
    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert({
        title: newsData.title,
        slug: uniqueSlug,
        excerpt: newsData.excerpt,
        content: newsData.content,
        cover_image: coverImage,
        category: category || "Geral",
        author: newsData.author || "Redação IA",
        is_featured: false,
        is_breaking: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar notícia no banco de dados" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("News created successfully:", post.id);

    return new Response(
      JSON.stringify({ success: true, post }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
