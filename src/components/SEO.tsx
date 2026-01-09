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
}

const SITE_NAME = "JG News";
const DEFAULT_DESCRIPTION = "Portal de notícias com as últimas atualizações em política, economia, esportes, tecnologia e entretenimento. Notícias em tempo real 24 horas.";
const DEFAULT_IMAGE = "https://jgnews.com.br/pwa-512x512.png";
const SITE_URL = "https://jgnews.com.br";

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "notícias, jornalismo, política, economia, esportes, tecnologia, entretenimento, Brasil, mundo, atualidades",
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  article,
  noindex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Portal de Notícias`;
  const fullUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  // Truncate description to 160 chars for SEO
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + "..." 
    : description;

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/pwa-512x512.png`,
      width: 512,
      height: 512,
    },
    sameAs: [],
  };

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Article Schema (if article type)
  const articleSchema = article
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: title,
        description: truncatedDescription,
        image: fullImage,
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
        author: {
          "@type": "Person",
          name: article.author || "Redação JG News",
        },
        publisher: {
          "@type": "NewsMediaOrganization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/pwa-512x512.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": fullUrl,
        },
        articleSection: article.category,
      }
    : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="JG News" />
      <link rel="canonical" href={fullUrl} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
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
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title || SITE_NAME} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
