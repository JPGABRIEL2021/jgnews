import { Link } from "react-router-dom";
import { Post } from "@/lib/posts";
import CategoryBadge from "./CategoryBadge";
import TimeAgo from "./TimeAgo";

interface NewsCardProps {
  post: Post;
  variant?: "horizontal" | "compact";
}

const NewsCard = ({ post, variant = "horizontal" }: NewsCardProps) => {
  if (variant === "compact") {
    return (
      <Link
        to={`/post/${post.slug}`}
        className="group flex gap-3 py-3 border-b border-news last:border-b-0"
      >
        <div className="w-24 h-16 flex-shrink-0 overflow-hidden rounded">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h3 className="text-sm font-semibold text-news-primary line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <TimeAgo date={post.created_at} className="text-xs mt-1" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/post/${post.slug}`}
      className="group flex gap-4 py-4 border-b border-news news-card-hover animate-fade-in"
    >
      {/* Thumbnail */}
      <div className="w-32 sm:w-40 md:w-48 h-24 sm:h-28 md:h-32 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-full object-cover news-card-image transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <CategoryBadge category={post.category} size="sm" />
          <TimeAgo date={post.created_at} className="text-xs hidden sm:inline" />
        </div>
        <h3 className="headline-tertiary news-card-title line-clamp-2 sm:line-clamp-3 transition-colors">
          {post.title}
        </h3>
        <p className="text-news-muted text-sm line-clamp-2 mt-1 hidden md:block">
          {post.excerpt}
        </p>
        <TimeAgo date={post.created_at} className="text-xs mt-2 sm:hidden" />
      </div>
    </Link>
  );
};

export default NewsCard;
