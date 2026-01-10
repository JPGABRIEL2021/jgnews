import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Post } from "@/lib/posts";
import CategoryBadge from "./CategoryBadge";
import TimeAgo from "./TimeAgo";
import OptimizedImage from "./OptimizedImage";
import { useLinkPrefetch } from "@/hooks/usePrefetch";
import { Button } from "@/components/ui/button";

interface GloboStyleGridProps {
  posts: Post[];
}

const SensitiveOverlay = ({ onReveal }: { onReveal: () => void }) => (
  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-10">
    <div className="text-center text-white px-4 mb-2">
      <p className="text-sm font-medium">Conteúdo sensível</p>
    </div>
    <Button
      variant="secondary"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onReveal();
      }}
    >
      <Eye size={14} className="mr-1" />
      Ver imagem
    </Button>
  </div>
);

// Card de destaque principal (grande à esquerda)
const MainCard = ({ post, isRevealed, onReveal, handleMouseEnter }: { 
  post: Post; 
  isRevealed: boolean; 
  onReveal: () => void;
  handleMouseEnter: (slug: string) => void;
}) => {
  const showBlur = post.is_sensitive && !isRevealed;
  
  return (
    <Link
      to={`/post/${post.slug}`}
      className="group relative overflow-hidden rounded-xl block"
      onMouseEnter={() => handleMouseEnter(post.slug)}
      onFocus={() => handleMouseEnter(post.slug)}
    >
      <div className="relative">
        <OptimizedImage
          src={post.cover_image}
          alt={`Imagem: ${post.title}`}
          aspectRatio="16/10"
          containerClassName={`aspect-[4/3] md:aspect-[16/10] ${showBlur ? 'blur-xl scale-110' : ''}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showBlur && <SensitiveOverlay onReveal={onReveal} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight line-clamp-3 group-hover:text-primary-foreground/90 transition-colors">
            {post.title}
          </h2>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
            <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded">
              • {post.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Cards secundários (à direita, menores)
const SecondaryCard = ({ post, isRevealed, onReveal, handleMouseEnter }: { 
  post: Post; 
  isRevealed: boolean; 
  onReveal: () => void;
  handleMouseEnter: (slug: string) => void;
}) => {
  const showBlur = post.is_sensitive && !isRevealed;
  
  return (
    <Link
      to={`/post/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-card hover:shadow-lg transition-shadow"
      onMouseEnter={() => handleMouseEnter(post.slug)}
      onFocus={() => handleMouseEnter(post.slug)}
    >
      <div className="relative">
        <OptimizedImage
          src={post.cover_image}
          alt={`Imagem: ${post.title}`}
          aspectRatio="16/9"
          containerClassName={`aspect-[16/9] ${showBlur ? 'blur-xl scale-110' : ''}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {showBlur && <SensitiveOverlay onReveal={onReveal} />}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm md:text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 mt-auto pt-2 text-xs text-muted-foreground">
          <span className="text-primary font-medium">{post.category}</span>
          <span>•</span>
          <TimeAgo date={post.created_at} className="text-xs" />
        </div>
      </div>
    </Link>
  );
};

// Card pequeno horizontal (lista abaixo do grid principal)
const SmallCard = ({ post, isRevealed, onReveal, handleMouseEnter }: { 
  post: Post; 
  isRevealed: boolean; 
  onReveal: () => void;
  handleMouseEnter: (slug: string) => void;
}) => {
  const showBlur = post.is_sensitive && !isRevealed;
  
  return (
    <Link
      to={`/post/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-card hover:shadow-md transition-shadow"
      onMouseEnter={() => handleMouseEnter(post.slug)}
      onFocus={() => handleMouseEnter(post.slug)}
    >
      <div className="relative">
        <OptimizedImage
          src={post.cover_image}
          alt={`Imagem: ${post.title}`}
          aspectRatio="16/9"
          containerClassName={`aspect-[16/9] ${showBlur ? 'blur-xl scale-110' : ''}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {showBlur && <SensitiveOverlay onReveal={onReveal} />}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {post.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-primary font-medium">{post.category}</span>
        </div>
      </div>
    </Link>
  );
};

const GloboStyleGrid = ({ posts }: GloboStyleGridProps) => {
  const { handleMouseEnter } = useLinkPrefetch();
  const [revealedPosts, setRevealedPosts] = useState<Set<string>>(new Set());

  const revealPost = (postId: string) => {
    setRevealedPosts(prev => new Set(prev).add(postId));
  };

  if (posts.length < 3) return null;

  // Layout: 1 principal, 2 secundários à direita, 3+ abaixo em grid
  const mainPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);
  const gridPosts = posts.slice(3, 7);

  return (
    <section className="container py-4 md:py-6">
      {/* Grid Principal - Estilo Globo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* Coluna Principal (2/3) */}
        <div className="lg:col-span-2">
          <MainCard 
            post={mainPost}
            isRevealed={revealedPosts.has(mainPost.id)}
            onReveal={() => revealPost(mainPost.id)}
            handleMouseEnter={handleMouseEnter}
          />
        </div>

        {/* Coluna Secundária (1/3) */}
        <div className="flex flex-col gap-4">
          {secondaryPosts.map((post) => (
            <SecondaryCard
              key={post.id}
              post={post}
              isRevealed={revealedPosts.has(post.id)}
              onReveal={() => revealPost(post.id)}
              handleMouseEnter={handleMouseEnter}
            />
          ))}
        </div>
      </div>

      {/* Grid de Notícias Menores */}
      {gridPosts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 lg:mt-5">
          {gridPosts.map((post) => (
            <SmallCard
              key={post.id}
              post={post}
              isRevealed={revealedPosts.has(post.id)}
              onReveal={() => revealPost(post.id)}
              handleMouseEnter={handleMouseEnter}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default GloboStyleGrid;
