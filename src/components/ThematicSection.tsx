import { Link } from "react-router-dom";
import { Post } from "@/lib/posts";
import { useCategoryPosts } from "@/hooks/usePosts";
import OptimizedImage from "./OptimizedImage";
import TimeAgo from "./TimeAgo";
import { Skeleton } from "./ui/skeleton";
import { ArrowRight, LucideIcon } from "lucide-react";
import { useLinkPrefetch } from "@/hooks/usePrefetch";

interface ThematicSectionProps {
  category: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  maxPosts?: number;
}

const ThematicSection = ({ 
  category, 
  icon: Icon, 
  color, 
  bgGradient,
  maxPosts = 5 
}: ThematicSectionProps) => {
  const { data: posts = [], isLoading } = useCategoryPosts(category);
  const { handleMouseEnter } = useLinkPrefetch();
  
  const displayPosts = posts.slice(0, maxPosts);
  const mainPost = displayPosts[0];
  const sidePosts = displayPosts.slice(1);

  if (!isLoading && displayPosts.length === 0) {
    return null;
  }

  return (
    <section className={`py-6 ${bgGradient}`}>
      <div className="container">
        {/* Section Header with Line */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{category}</h2>
          <div className="flex-1 h-px bg-border" />
          <Link 
            to={`/category/${category}`} 
            className={`flex items-center gap-1 text-sm font-medium ${color.replace('bg-', 'text-').replace('-600', '-500')} hover:underline transition-colors`}
          >
            Ver mais
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <Skeleton className="aspect-[16/10] rounded-lg" />
            </div>
            <div className="lg:col-span-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Post */}
            {mainPost && (
              <div className="lg:col-span-7">
                <Link 
                  to={`/post/${mainPost.slug}`}
                  className="group block relative overflow-hidden rounded-lg"
                  onMouseEnter={() => handleMouseEnter(mainPost.slug)}
                >
                  <OptimizedImage
                    src={mainPost.cover_image}
                    alt={`Imagem: ${mainPost.title}`}
                    aspectRatio="16/10"
                    containerClassName="aspect-[16/10]"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight line-clamp-3 group-hover:text-primary-foreground/90 transition-colors">
                      {mainPost.title}
                    </h3>
                    <p className="text-white/70 text-sm mt-2 line-clamp-2 hidden md:block">
                      {mainPost.excerpt}
                    </p>
                    <TimeAgo date={mainPost.created_at} className="text-white/50 text-xs mt-2" />
                  </div>
                </Link>
              </div>
            )}

            {/* Side Posts List */}
            <div className="lg:col-span-5">
              <div className="divide-y divide-border">
                {sidePosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.slug}`}
                    className="group flex gap-3 py-3 first:pt-0 last:pb-0"
                    onMouseEnter={() => handleMouseEnter(post.slug)}
                  >
                    <div className="relative w-24 h-16 md:w-28 md:h-[72px] flex-shrink-0 rounded overflow-hidden">
                      <OptimizedImage
                        src={post.cover_image}
                        alt={`Imagem: ${post.title}`}
                        aspectRatio="16/9"
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <span className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {post.title}
                      </span>
                      <TimeAgo date={post.created_at} className="text-xs text-muted-foreground mt-1.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ThematicSection;
