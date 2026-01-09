import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    category?: string;
  };
  noindex?: boolean;
  preloadImage?: boolean;
}

const SITE_NAME = "JG News";
const DEFAULT_DESCRIPTION = "Portal de notícias com as últimas atualizações em política, economia, esportes, tecnologia e entretenimento. Notícias em tempo real 24 horas.";
const DEFAULT_IMAGE = "https://jgnews.com.br/pwa-512x512.png";
const SITE_URL = "https://jgnews.com.br";
const LOGO_URL = `${SITE_URL}/pwa-512x512.png`;

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "notícias, jornalismo, política, economia, esportes, tecnologia, entretenimento, Brasil, mundo, atualidades",
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  article,
  noindex = false,
  preloadImage = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Portal de Notícias`;
  const currentUrl = typeof window !== "undefined" ? window.location.href : SITE_URL;
  const fullUrl = url || currentUrl;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  // Truncate description to 160 chars for SEO
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + "..." 
    : description;

  // Publisher object for NewsArticle schema
  const publisherSchema = {
    "@type": "NewsMediaOrganization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    sameAs: [],
  };

  // Website Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/pesquisa?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // NewsArticle Schema (Schema.org standard)
  const newsArticleSchema = article
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": fullUrl,
        },
        headline: title?.substring(0, 110) || SITE_NAME, // Google recommends max 110 chars
        description: truncatedDescription,
        image: {
          "@type": "ImageObject",
          url: fullImage,
          width: 1200,
          height: 630,
        },
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
        author: {
          "@type": "Person",
          name: article.author || "JG News",
        },
        publisher: publisherSchema,
        articleSection: article.category,
        inLanguage: "pt-BR",
      }
    : null;

  // Preload hero image URL for LCP optimization
  const preloadImageUrl = preloadImage && image !== DEFAULT_IMAGE ? image : null;

  return (
    <Helmet>
      {/* Preload hero image for LCP optimization */}
      {preloadImageUrl && (
        <link 
          rel="preload" 
          as="image" 
          href={preloadImageUrl}
        />
      )}
      
      {/* Basic Meta Tags - unique per page */}
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={article?.author || "JG News"} />
      <link rel="canonical" href={fullUrl} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph - unique per page */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title || SITE_NAME} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Article specific OG tags */}
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {article?.category && (
        <meta property="article:section" content={article.category} />
      )}
      
      {/* Twitter Card - unique per page */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || SITE_NAME} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title || SITE_NAME} />
      
      {/* Schema.org JSON-LD - Organization */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      {/* Schema.org JSON-LD - WebSite */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      
      {/* Schema.org JSON-LD - NewsArticle (only for articles) */}
      {newsArticleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(newsArticleSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
