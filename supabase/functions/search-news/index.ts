import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NEWS_SITES = [
  "g1.globo.com",
  "folha.uol.com.br",
  "estadao.com.br"
];

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
    const { query, site } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Firecrawl não configurado. Conecte o Firecrawl nas configurações." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search query with site filters
    let searchQuery = query;
    if (site && NEWS_SITES.includes(site)) {
      searchQuery = `site:${site} ${query}`;
    } else {
      // Search all sites
      const siteFilters = NEWS_SITES.map(s => `site:${s}`).join(" OR ");
      searchQuery = `(${siteFilters}) ${query}`;
    }

    console.log("Searching news:", searchQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        lang: "pt",
        country: "BR",
        tbs: "qdr:w", // Last week
        scrapeOptions: {
          formats: ["markdown"]
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl API error:", data);
      return new Response(
        JSON.stringify({ error: data.error || "Erro ao buscar notícias" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${data.data?.length || 0} results`);

    // Format results
    const results = (data.data || []).map((item: any) => ({
      url: item.url,
      title: item.title || item.metadata?.title || "Sem título",
      description: item.description || item.metadata?.description || "",
      source: extractSource(item.url),
      markdown: item.markdown || "",
    }));

    return new Response(
      JSON.stringify({ success: true, results }),
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

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("g1.globo.com")) return "G1";
    if (hostname.includes("folha.uol.com.br")) return "Folha de S.Paulo";
    if (hostname.includes("estadao.com.br")) return "Estadão";
    return hostname;
  } catch {
    return "Desconhecido";
  }
}
