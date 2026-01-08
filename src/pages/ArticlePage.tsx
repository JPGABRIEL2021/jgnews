import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryBadge from "@/components/CategoryBadge";
import ShareButtons from "@/components/ShareButtons";
import NewsCard from "@/components/NewsCard";
import { getPostBySlug, getLatestPosts } from "@/data/mockPosts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug || "");
  const relatedPosts = getLatestPosts(4).filter(p => p.slug !== slug);

  if (!post) {
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-news-primary mt-4 mb-4 leading-tight">
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

          {/* Featured Image */}
          <figure className="mb-8">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full rounded-lg shadow-lg"
            />
            <figcaption className="text-sm text-news-muted mt-2 text-center">
              {post.title}
            </figcaption>
          </figure>

          {/* Share Buttons */}
          <div className="mb-8">
            <ShareButtons
              title={post.title}
              url={typeof window !== "undefined" ? window.location.href : ""}
            />
          </div>

          {/* Article Content */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Bottom Share */}
          <div className="mt-8 pt-6 border-t border-news">
            <ShareButtons
              title={post.title}
              url={typeof window !== "undefined" ? window.location.href : ""}
            />
          </div>
        </article>

        {/* Related Articles */}
        <section className="bg-news-subtle py-8">
          <div className="container max-w-4xl">
            <h2 className="text-xl font-bold text-news-primary mb-6 pb-3 border-b-2 border-primary">
              Veja também
            </h2>
            <div className="space-y-0">
              {relatedPosts.map((relatedPost) => (
                <NewsCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ArticlePage;
