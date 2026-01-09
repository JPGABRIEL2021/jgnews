import { Link } from "react-router-dom";
import { Post } from "@/lib/posts";
import { useCategoryPosts } from "@/hooks/usePosts";
import OptimizedImage from "./OptimizedImage";
import TimeAgo from "./TimeAgo";
import { Skeleton } from "./ui/skeleton";
import { Trophy, ArrowRight } from "lucide-react";

const SportsNewsSection = () => {
  const { data: sportsPosts = [], isLoading } = useCategoryPosts("Esportes");

  const displayPosts = sportsPosts.slice(0, 4);

  if (!isLoading && displayPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/20">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50">
              <Trophy className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-foreground">Esportes</h4>
              <p className="text-sm text-muted-foreground">Futebol, olimpíadas e mais</p>
            </div>
          </div>
          <Link 
            to="/categoria/Esportes" 
            className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

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
              <SportsNewsCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const SportsNewsCard = ({ post }: { post: Post }) => {
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
          <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-600 text-white">
            Esportes
          </span>
        </div>
      </div>
      <div className="p-4">
        <span className="font-semibold text-foreground line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors block">
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

export default SportsNewsSection;
