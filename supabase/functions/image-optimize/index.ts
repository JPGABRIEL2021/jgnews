import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// WebP optimization using wsrv.nl free image optimization service
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestUrl = new URL(req.url);
    const rawUrl = requestUrl.searchParams.get("url");
    const width = requestUrl.searchParams.get("w");
    const quality = requestUrl.searchParams.get("q") || "80";
    const format = requestUrl.searchParams.get("f") || "webp";

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

    // Check if the request accepts WebP
    const acceptHeader = req.headers.get("accept") || "";
    const supportsWebP = acceptHeader.includes("image/webp") || format === "webp";
    
    // Use images.weserv.nl - a reliable free image optimization service
    // Documentation: https://images.weserv.nl/docs/
    const optimizedUrl = new URL("https://images.weserv.nl/");
    optimizedUrl.searchParams.set("url", target.toString());
    
    // Set output format based on browser support
    if (supportsWebP) {
      optimizedUrl.searchParams.set("output", "webp");
    }
    
    // Set quality
    optimizedUrl.searchParams.set("q", quality);
    
    // Set width if provided (maintain aspect ratio)
    if (width) {
      optimizedUrl.searchParams.set("w", width);
      optimizedUrl.searchParams.set("we", ""); // without enlargement
    }
    
    // Enable progressive loading
    optimizedUrl.searchParams.set("il", "");
    
    // Set default background for transparent images
    optimizedUrl.searchParams.set("bg", "white");

    console.log("Image optimize request:", optimizedUrl.toString());

    const upstream = await fetch(optimizedUrl.toString(), {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; JGNewsImageOptimize/1.0; +https://jgnews.com.br)",
        "accept": "image/webp,image/avif,image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok || !upstream.body) {
      console.log("Optimization service failed, fetching original:", upstream.status);
      
      // Fallback: fetch original image directly
      const fallback = await fetch(target.toString(), {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; JGNewsImageOptimize/1.0; +https://jgnews.com.br)",
        },
      });
      
      if (!fallback.ok || !fallback.body) {
        console.log("Original fetch also failed:", fallback.status);
        return new Response(JSON.stringify({ error: "Image fetch failed" }), {
          status: 502,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }
      
      const contentType = fallback.headers.get("content-type") || "image/jpeg";
      
      return new Response(fallback.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "content-type": contentType,
          "cache-control": "public, max-age=31536000, immutable",
          "vary": "Accept",
          "x-optimized": "false",
        },
      });
    }

    const contentType = upstream.headers.get("content-type") || "image/webp";

    console.log("Image optimized successfully, content-type:", contentType);

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable",
        "vary": "Accept",
        "x-optimized": "true",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in image-optimize function:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
