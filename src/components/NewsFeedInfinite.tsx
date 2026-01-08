import { Post } from "@/lib/posts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import NewsCard from "./NewsCard";
import LoadingSpinner from "./LoadingSpinner";

interface NewsFeedInfiniteProps {
  posts: Post[];
  title?: string;
  isLoading?: boolean;
}

const NewsFeedInfinite = ({ posts, title = "Últimas Notícias", isLoading: externalLoading }: NewsFeedInfiniteProps) => {
  const { displayedPosts, hasMore, isLoading, loadMoreRef } = useInfiniteScroll({
    posts,
    postsPerPage: 5,
    isLoading: externalLoading,
  });

  return (
    <section className="py-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary">
        <h2 className="text-xl font-bold text-news-primary">{title}</h2>
        <div className="flex-1 h-px bg-news-border" />
      </div>
      
      {displayedPosts.length === 0 ? (
        <p className="text-center text-news-muted py-8">
          Nenhuma notícia disponível no momento.
        </p>
      ) : (
        <div className="divide-y divide-news">
          {displayedPosts.map((post, index) => (
            <div 
              key={post.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
            >
              <NewsCard post={post} />
            </div>
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isLoading && <LoadingSpinner text="Carregando mais notícias..." />}
        {!hasMore && displayedPosts.length > 0 && (
          <p className="text-center text-news-muted text-sm py-4">
            Você chegou ao fim das notícias
          </p>
        )}
      </div>
    </section>
  );
};

export default NewsFeedInfinite;
