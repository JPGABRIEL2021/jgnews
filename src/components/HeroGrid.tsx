import { Link } from "react-router-dom";
import { Post } from "@/lib/posts";
import CategoryBadge from "./CategoryBadge";
import TimeAgo from "./TimeAgo";

interface HeroGridProps {
  posts: Post[];
}

const HeroGrid = ({ posts }: HeroGridProps) => {
  if (posts.length < 3) return null;

  const [mainPost, ...sidePosts] = posts;

  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Article - Takes 2/3 on desktop */}
        <Link
          to={`/post/${mainPost.slug}`}
          className="lg:col-span-2 group relative overflow-hidden rounded-lg news-card-hover"
        >
          <div className="aspect-[16/9] lg:aspect-[16/10] overflow-hidden">
            <img
              src={mainPost.cover_image}
              alt={mainPost.title}
              className="w-full h-full object-cover news-card-image transition-transform duration-500"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
            <CategoryBadge category={mainPost.category} size="md" clickable={false} />
            <h1 className="headline-main text-white mt-3 mb-2 group-hover:text-primary-foreground/90 transition-colors line-clamp-4 sm:line-clamp-3 lg:line-clamp-none">
              {mainPost.title}
            </h1>
            <p className="text-white/80 text-base md:text-lg line-clamp-3 sm:line-clamp-2 mb-3 hidden sm:block">
              {mainPost.excerpt}
            </p>
            <TimeAgo date={mainPost.created_at} className="text-white/60 text-sm" />
          </div>
        </Link>

        {/* Side Articles - Stacked vertically */}
        <div className="flex flex-col gap-4">
          {sidePosts.slice(0, 2).map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group relative overflow-hidden rounded-lg news-card-hover flex-1"
            >
              <div className="h-full min-h-[200px] overflow-hidden">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover news-card-image transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <CategoryBadge category={post.category} size="sm" clickable={false} />
                <h2 className="headline-secondary text-white mt-2 line-clamp-3 group-hover:text-primary-foreground/90 transition-colors">
                  {post.title}
                </h2>
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
