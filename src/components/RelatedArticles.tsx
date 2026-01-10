import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Post } from "@/lib/posts";
import { usePosts } from "@/hooks/usePosts";
import OptimizedImage from "@/components/OptimizedImage";
import TimeAgo from "@/components/TimeAgo";
import CategoryBadge from "@/components/CategoryBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedArticlesProps {
  currentPost: Post;
  maxPosts?: number;
}

const RelatedArticles = ({ currentPost, maxPosts = 4 }: RelatedArticlesProps) => {
  const { data: allPosts = [], isLoading } = usePosts();

  // Get related posts: same category first, then others
  const relatedPosts = allPosts
    .filter(p => p.slug !== currentPost.slug)
    .sort((a, b) => {
      // Prioritize same category
      const aCategory = a.category === currentPost.category ? 1 : 0;
      const bCategory = b.category === currentPost.category ? 1 : 0;
      if (aCategory !== bCategory) return bCategory - aCategory;
      // Then by date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, maxPosts);

  if (isLoading) {
    return (
      <section className="py-10 bg-gradient-to-b from-muted/30 to-background">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-card">
                <Skeleton className="w-24 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (relatedPosts.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-4xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground font-serif">
              Leia também
            </h3>
          </div>
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            Ver mais <ArrowRight size={14} />
          </Link>
        </div>

        {/* Related Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group flex gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <CategoryBadge category={post.category} size="sm" />
                <h4 className="text-sm font-semibold text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors font-serif">
                  {post.title}
                </h4>
                <div className="text-xs text-muted-foreground mt-1">
                  <TimeAgo date={post.created_at} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedArticles;
