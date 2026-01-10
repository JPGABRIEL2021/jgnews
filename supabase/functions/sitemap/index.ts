import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

const SITE_URL = "https://jgnews.com.br";
const SITE_NAME = "JG News";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published posts
    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, title, updated_at, category")
      .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }

    console.log(`Generating sitemap with ${posts?.length || 0} posts`);

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "hourly" },
      { url: "/sobre", priority: "0.5", changefreq: "monthly" },
      { url: "/contato", priority: "0.5", changefreq: "monthly" },
      { url: "/privacidade", priority: "0.3", changefreq: "yearly" },
      { url: "/termos", priority: "0.3", changefreq: "yearly" },
      { url: "/busca", priority: "0.6", changefreq: "daily" },
    ];

    // Category pages
    const categories = ["Política", "Economia", "Esportes", "Tecnologia", "Entretenimento", "Mundo", "Brasil"];
    const categoryPages = categories.map((cat) => ({
      url: `/category/${cat.toLowerCase()}`,
      priority: "0.7",
      changefreq: "hourly",
    }));

    // Build XML
    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add category pages
    for (const page of categoryPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add article pages
    if (posts && posts.length > 0) {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      for (const post of posts) {
        const publishedDate = new Date(post.updated_at);
        const lastmod = publishedDate.toISOString().split("T")[0];
        const isRecent = publishedDate > twoDaysAgo;

        xml += `  <url>
    <loc>${SITE_URL}/post/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;

        if (isRecent) {
          xml += `    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${publishedDate.toISOString()}</news:publication_date>
      <news:title>${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>
`;
        }

        xml += `  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }
});
