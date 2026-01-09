import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schemas
const ReviseTextSchema = z.object({
  text: z.string()
    .min(10, "Text must be at least 10 characters")
    .max(50000, "Text must be less than 50,000 characters") // ~50KB limit
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
    const validated = ReviseTextSchema.safeParse(body);
    if (!validated.success) {
      console.error("Input validation failed:", validated.error.issues);
      return new Response(
        JSON.stringify({ error: "Dados inválidos", details: validated.error.issues.map(i => i.message) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { text } = validated.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Lovable AI key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Revising text as editor-in-chief...");

    const systemPrompt = `Você é um editor-chefe experiente de um grande portal de notícias brasileiro.

Sua tarefa é REVISAR o texto fornecido seguindo estas diretrizes:

1. CORREÇÃO DO PORTUGUÊS
   - Corrija erros gramaticais e ortográficos
   - Ajuste a concordância verbal e nominal
   - Corrija pontuação

2. ELIMINE SENSACIONALISMO
   - Remova adjetivos exagerados
   - Substitua verbos sensacionalistas por equivalentes neutros
   - Elimine expressões apelativas ou emocionais
   - Mantenha apenas fatos objetivos

3. CLAREZA E FLUIDEZ
   - Simplifique frases muito longas ou complexas
   - Melhore a ordem das informações
   - Elimine redundâncias
   - Use voz ativa quando possível

4. TOM JORNALÍSTICO
   - Mantenha objetividade
   - Preserve a imparcialidade
   - Use linguagem formal mas acessível
   - Siga o padrão editorial de portais como Globo.com

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

FORMATO DA RESPOSTA:
Retorne um JSON com a seguinte estrutura:
{
  "revisedText": "O texto revisado completo",
  "isUrgent": true ou false,
  "urgentReason": "Motivo da classificação como urgente (se aplicável)",
  "changes": [
    {
      "type": "grammar|clarity|sensationalism|style|seo",
      "original": "trecho original",
      "revised": "trecho corrigido",
      "reason": "breve explicação"
    }
  ],
  "seoImprovements": ["Lista de melhorias de SEO aplicadas"],
  "summary": "Resumo das principais alterações feitas"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Revise o seguinte texto:\n\n${text}` }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar revisão" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Resposta vazia do serviço de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let result;
    try {
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
      result = JSON.parse(cleanContent.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      result = {
        revisedText: content,
        changes: [],
        summary: "Texto revisado (formato de resposta simplificado)"
      };
    }

    console.log("Revision completed successfully");

    return new Response(
      JSON.stringify({ success: true, ...result }),
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
