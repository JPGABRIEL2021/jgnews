import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Post } from "@/lib/posts";
import CategoryBadge from "./CategoryBadge";
import TimeAgo from "./TimeAgo";
import OptimizedImage from "./OptimizedImage";
import { useLinkPrefetch } from "@/hooks/usePrefetch";
import { Button } from "@/components/ui/button";

interface NewsCardProps {
  post: Post;
  variant?: "horizontal" | "compact";
}

const NewsCard = ({ post, variant = "horizontal" }: NewsCardProps) => {
  const { handleMouseEnter } = useLinkPrefetch();
  const [isRevealed, setIsRevealed] = useState(false);
  const showBlur = post.is_sensitive && !isRevealed;

  if (variant === "compact") {
    return (
      <article>
        <Link
          to={`/post/${post.slug}`}
          className="group flex gap-3 py-3 border-b border-news last:border-b-0"
          onMouseEnter={() => handleMouseEnter(post.slug)}
          onFocus={() => handleMouseEnter(post.slug)}
        >
          <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
            <OptimizedImage
              src={post.cover_image}
              alt={`Imagem: ${post.title}`}
              aspectRatio="3/2"
              containerClassName={`w-full h-full ${showBlur ? 'blur-lg scale-110' : ''}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {showBlur && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[10px] px-2 py-1 h-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsRevealed(true);
                  }}
                >
                  <Eye size={12} className="mr-1" />
                  Ver
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h3 className="text-sm font-semibold text-news-primary line-clamp-2 group-hover:text-primary transition-colors block">
              {post.title}
            </h3>
            <TimeAgo date={post.created_at} className="text-xs mt-1" />
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article>
      <Link
        to={`/post/${post.slug}`}
        className="group flex gap-4 py-4 border-b border-news news-card-hover animate-fade-in"
        onMouseEnter={() => handleMouseEnter(post.slug)}
        onFocus={() => handleMouseEnter(post.slug)}
      >
        {/* Thumbnail */}
        <div className="relative w-32 sm:w-40 md:w-48 h-24 sm:h-28 md:h-32 flex-shrink-0 rounded-lg overflow-hidden">
          <OptimizedImage
            src={post.cover_image}
            alt={`Imagem: ${post.title}`}
            aspectRatio="16/9"
            containerClassName={`w-full h-full ${showBlur ? 'blur-lg scale-110' : ''}`}
            className="w-full h-full object-cover news-card-image"
          />
          {showBlur && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRevealed(true);
                }}
              >
                <Eye size={14} className="mr-1" />
                Ver imagem
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge category={post.category} size="sm" />
            <TimeAgo date={post.created_at} className="text-xs hidden sm:inline" />
          </div>
          <h3 className="headline-tertiary news-card-title line-clamp-2 sm:line-clamp-3 block">
            {post.title}
          </h3>
          <p className="text-news-muted text-sm line-clamp-2 mt-1 hidden md:block transition-colors duration-300 group-hover:text-news-secondary">
            {post.excerpt}
          </p>
          <TimeAgo date={post.created_at} className="text-xs mt-2 sm:hidden" />
        </div>
      </Link>
    </article>
  );
};

export default NewsCard;
