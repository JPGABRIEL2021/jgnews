import { Link } from "react-router-dom";
import { Post } from "@/lib/posts";
import { useCategoryPosts } from "@/hooks/usePosts";
import OptimizedImage from "./OptimizedImage";
import TimeAgo from "./TimeAgo";
import { Skeleton } from "./ui/skeleton";
import { Heart, ArrowRight } from "lucide-react";

const HealthNewsSection = () => {
  const { data: healthPosts = [], isLoading } = useCategoryPosts("Saúde");

  // Show only the first 4 posts
  const displayPosts = healthPosts.slice(0, 4);

  if (!isLoading && displayPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-950/20">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50">
              <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-foreground">Saúde</h4>
              <p className="text-sm text-muted-foreground">Notícias e informações sobre saúde</p>
            </div>
          </div>
          <Link 
            to="/category/Saúde" 
            className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayPosts.map((post) => (
              <HealthNewsCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const HealthNewsCard = ({ post }: { post: Post }) => {
  return (
    <Link 
      to={`/post/${post.slug}`} 
      className="group block bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border"
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <OptimizedImage
          src={post.cover_image}
          alt={`Imagem: ${post.title}`}
          aspectRatio="16/9"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-semibold rounded bg-green-600 text-white">
            Saúde
          </span>
        </div>
      </div>
      <div className="p-4">
        <span className="font-semibold text-foreground line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors block">
          {post.title}
        </span>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          <TimeAgo date={post.created_at} />
        </div>
      </div>
    </Link>
  );
};

export default HealthNewsSection;
