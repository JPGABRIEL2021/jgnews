import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, ExternalLink } from "lucide-react";
import DOMPurify from "dompurify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryBadge from "@/components/CategoryBadge";
import ShareButtons from "@/components/ShareButtons";
import RelatedArticles from "@/components/RelatedArticles";
import LoadingSpinner from "@/components/LoadingSpinner";
import SEO from "@/components/SEO";
import SensitiveImage from "@/components/SensitiveImage";
import AdBanner from "@/components/AdBanner";
import { usePost, usePostsRealtime } from "@/hooks/usePosts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PostSource } from "@/lib/posts";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Enable realtime updates
  usePostsRealtime();

  const { data: post, isLoading, error } = usePost(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner text="Carregando artigo..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-news-primary mb-4">
              Artigo não encontrado
            </h1>
            <Link to="/" className="text-primary hover:underline">
              Voltar para a página inicial
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  const siteUrl = "https://jgnews.com.br";
  const breadcrumbs = [
    { name: "Início", url: siteUrl },
    { name: post.category, url: `${siteUrl}/categoria/${encodeURIComponent(post.category.toLowerCase())}` },
    { name: post.title, url: `${siteUrl}/post/${post.slug}` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.cover_image}
        type="article"
        article={{
          publishedTime: post.created_at,
          modifiedTime: post.updated_at,
          author: post.author || "Redação JG News",
          category: post.category,
        }}
        keywords={`${post.category}, notícias, ${post.title.split(" ").slice(0, 5).join(", ")}`}
        preloadImage={true}
        breadcrumbs={breadcrumbs}
      />
      <Header />

      <main className="flex-1">
        {/* Back Link */}
        <div className="container py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-news-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para início
          </Link>
        </div>

        <article className="container max-w-4xl pb-12">
          {/* Article Header */}
          <header className="mb-8">
            <CategoryBadge category={post.category} size="lg" />

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-news-primary mt-4 mb-4 leading-tight font-serif">
              {post.title}
            </h1>

            <p className="text-xl text-news-secondary mb-6">
              {post.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-news-muted pb-4 border-b border-news">
              {post.author && (
                <div className="flex items-center gap-1.5">
                  <User size={14} />
                  <span>Por <strong className="text-news-primary">{post.author}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <time dateTime={post.created_at}>{formattedDate}</time>
              </div>
            </div>
          </header>

          {/* Featured Image - Hero image with priority loading for LCP */}
          <figure className="mb-2">
            <SensitiveImage
              src={post.cover_image}
              alt={`Imagem: ${post.title}`}
              isSensitive={post.is_sensitive}
              aspectRatio="16/9"
              containerClassName="rounded-lg shadow-lg"
              className="w-full h-full object-cover"
              fetchPriority="high"
            />
            <figcaption className="text-sm text-news-muted mt-1.5 text-center">
              {post.title}
            </figcaption>
          </figure>

          {/* Share Buttons - Prominent */}
          <div className="mb-6">
            <ShareButtons
              title={post.title}
              url={typeof window !== "undefined" ? window.location.href : ""}
              slug={post.slug}
              variant="prominent"
            />
          </div>

          {/* Ad Banner - Before Content - Optimized */}
          <div className="mb-8 -mx-4 md:mx-0">
            <AdBanner 
              format="horizontal" 
              className="min-h-[100px] md:min-h-[120px] bg-gradient-to-r from-muted/40 to-muted/20 rounded-none md:rounded-xl border-y md:border border-border/50" 
            />
          </div>

          {/* Article Content - Sanitized to prevent XSS */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content, {
                ALLOWED_TAGS: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'br', 'span'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
              })
            }}
          />

          {/* Reference Sources */}
          {post.sources && post.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-news">
              <p className="text-sm text-news-muted">
                {post.sources.length === 1 ? 'Fonte: ' : 'Fontes: '}
                {post.sources.map((source: PostSource, index: number) => (
                  <span key={index}>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {source.name}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span>{source.name}</span>
                    )}
                    {index < post.sources.length - 1 && ', '}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Ad Banner - After Content - Optimized */}
          <div className="my-8 -mx-4 md:mx-0">
            <AdBanner 
              format="rectangle" 
              className="min-h-[280px] md:min-h-[300px] bg-gradient-to-br from-muted/30 via-muted/20 to-transparent rounded-none md:rounded-xl border-y md:border border-border/50" 
            />
          </div>

          {/* Bottom Share - Prominent */}
          <div className="mt-8 pt-6 border-t border-border">
            <ShareButtons
              title={post.title}
              url={typeof window !== "undefined" ? window.location.href : ""}
              slug={post.slug}
              variant="prominent"
            />
          </div>

          {/* Floating Share Button - Mobile Only */}
          <ShareButtons
            title={post.title}
            url={typeof window !== "undefined" ? window.location.href : ""}
            slug={post.slug}
            variant="floating"
          />
        </article>

        {/* Related Articles - Improved component */}
        {post && <RelatedArticles currentPost={post} />}
      </main>

      <Footer />
    </div>
  );
};

export default ArticlePage;
