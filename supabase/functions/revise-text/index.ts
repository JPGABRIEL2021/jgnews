import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Texto é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
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

FORMATO DA RESPOSTA:
Retorne um JSON com a seguinte estrutura:
{
  "revisedText": "O texto revisado completo",
  "changes": [
    {
      "type": "grammar|clarity|sensationalism|style",
      "original": "trecho original",
      "revised": "trecho corrigido",
      "reason": "breve explicação"
    }
  ],
  "summary": "Resumo das principais alterações feitas"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
      console.error("OpenAI API error:", response.status, errorText);
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
