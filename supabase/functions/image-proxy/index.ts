import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestUrl = new URL(req.url);
    const rawUrl = requestUrl.searchParams.get("url");

    if (!rawUrl) {
      return new Response(JSON.stringify({ error: "Missing 'url' query param" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    let target: URL;
    try {
      target = new URL(rawUrl);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid 'url'" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (target.protocol !== "https:" && target.protocol !== "http:") {
      return new Response(JSON.stringify({ error: "Only http/https URLs are allowed" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const hostname = target.hostname.toLowerCase();

    // Basic SSRF hardening
    const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
    const isIpv6 = hostname.includes(":");
    const isLocalhost = hostname === "localhost" || hostname.endsWith(".local");

    if (isIpv4 || isIpv6 || isLocalhost) {
      return new Response(JSON.stringify({ error: "Blocked host" }), {
        status: 403,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    console.log("Image proxy fetch:", target.toString());

    const upstream = await fetch(target.toString(), {
      headers: {
        // Some CDNs block unknown bots; mimic a common UA.
        "user-agent":
          "Mozilla/5.0 (compatible; JGNewsImageProxy/1.0; +https://jgnews.com.br)",
      },
    });

    if (!upstream.ok || !upstream.body) {
      console.log("Upstream failed:", upstream.status);
      return new Response(JSON.stringify({ error: "Upstream image fetch failed" }), {
        status: 502,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "content-type": contentType,
        // With cache-busting on the URL, we can allow long caching safely.
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in image-proxy function:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
