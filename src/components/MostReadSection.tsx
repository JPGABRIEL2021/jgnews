import { Link } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { Skeleton } from "./ui/skeleton";
import { Flame } from "lucide-react";

const MostReadSection = () => {
  const { data: posts = [], isLoading } = usePosts();

  // Simulate "most read" by taking first 5 posts (in production, you'd track views)
  const mostReadPosts = posts.slice(0, 5);

  if (!isLoading && mostReadPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50">
            <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mais Lidas</h2>
            <p className="text-sm text-muted-foreground">As notícias mais acessadas</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {mostReadPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                className="group flex gap-3 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground line-clamp-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {post.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MostReadSection;
