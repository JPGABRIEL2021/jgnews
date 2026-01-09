import { Link } from "react-router-dom";
import { Post } from "@/lib/posts";
import CategoryBadge from "./CategoryBadge";
import TimeAgo from "./TimeAgo";
import OptimizedImage from "./OptimizedImage";
import { useLinkPrefetch } from "@/hooks/usePrefetch";

interface HeroGridProps {
  posts: Post[];
}

const HeroGrid = ({ posts }: HeroGridProps) => {
  const { handleMouseEnter } = useLinkPrefetch();
  
  if (posts.length < 3) return null;

  const [mainPost, ...sidePosts] = posts;

  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Article - Takes 2/3 on desktop */}
        <Link
          to={`/post/${mainPost.slug}`}
          className="lg:col-span-2 group relative overflow-hidden rounded-lg news-card-hover animate-fade-in"
          onMouseEnter={() => handleMouseEnter(mainPost.slug)}
          onFocus={() => handleMouseEnter(mainPost.slug)}
        >
          <OptimizedImage
            src={mainPost.cover_image}
            alt={`Imagem: ${mainPost.title}`}
            aspectRatio="16/10"
            containerClassName="aspect-[16/9] lg:aspect-[16/10]"
            className="w-full h-full object-cover news-card-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
            <CategoryBadge category={mainPost.category} size="md" clickable={false} />
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-3 mb-2 group-hover:text-primary-foreground/90 transition-colors duration-300 line-clamp-4 sm:line-clamp-3 lg:line-clamp-none leading-tight">
              {mainPost.title}
            </h2>
            <p className="text-white/80 text-sm sm:text-base md:text-lg line-clamp-3 sm:line-clamp-2 mb-3 hidden sm:block transition-opacity duration-300 group-hover:text-white/90">
              {mainPost.excerpt}
            </p>
            <TimeAgo date={mainPost.created_at} className="text-white/60 text-sm" />
          </div>
        </Link>

        {/* Side Articles - Stacked vertically */}
        <div className="flex flex-col gap-4">
          {sidePosts.slice(0, 2).map((post, index) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group relative overflow-hidden rounded-lg news-card-hover flex-1 animate-fade-in"
              style={{ animationDelay: `${(index + 1) * 150}ms`, animationFillMode: 'backwards' }}
              onMouseEnter={() => handleMouseEnter(post.slug)}
              onFocus={() => handleMouseEnter(post.slug)}
            >
              <OptimizedImage
                src={post.cover_image}
                alt={`Imagem: ${post.title}`}
                aspectRatio="16/9"
                containerClassName="h-full min-h-[200px]"
                className="w-full h-full object-cover news-card-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <CategoryBadge category={post.category} size="sm" clickable={false} />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mt-2 line-clamp-3 group-hover:text-primary-foreground/90 transition-colors duration-300 leading-tight">
                  {post.title}
                </h3>
                <TimeAgo date={post.created_at} className="text-white/60 text-xs mt-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroGrid;
