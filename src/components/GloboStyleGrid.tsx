import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Post } from "@/lib/posts";
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
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 lg:p-6">
          <span className="inline-block text-xs font-semibold text-primary bg-white/95 px-2 py-0.5 rounded mb-2">
            {post.category}
          </span>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight line-clamp-3 group-hover:text-primary-foreground/90 transition-colors">
            {post.title}
          </h2>
          <p className="text-white/70 text-sm mt-2 line-clamp-2 hidden md:block">
            {post.excerpt}
          </p>
          <TimeAgo date={post.created_at} className="text-white/50 text-xs mt-2" />
        </div>
      </div>
    </Link>
  );
};

// Cards secundários (à direita)
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
      className="group relative overflow-hidden rounded-lg block"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          <span className="inline-block text-[10px] font-semibold text-primary bg-white/95 px-1.5 py-0.5 rounded mb-1.5">
            {post.category}
          </span>
          <h3 className="text-sm md:text-base font-semibold text-white line-clamp-2 group-hover:text-primary-foreground/90 transition-colors leading-tight">
            {post.title}
          </h3>
        </div>
      </div>
    </Link>
  );
};

// Card pequeno para grid inferior
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
      className="group flex flex-col overflow-hidden rounded-lg bg-card border border-border hover:shadow-md transition-all"
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
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
          {post.category}
        </span>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight mt-1">
          {post.title}
        </h3>
      </div>
    </Link>
  );
};

// Lista horizontal para mobile
const MobileListCard = ({ post, isRevealed, onReveal, handleMouseEnter }: { 
  post: Post; 
  isRevealed: boolean; 
  onReveal: () => void;
  handleMouseEnter: (slug: string) => void;
}) => {
  const showBlur = post.is_sensitive && !isRevealed;
  
  return (
    <Link
      to={`/post/${post.slug}`}
      className="group flex gap-3 py-3 border-b border-border last:border-b-0"
      onMouseEnter={() => handleMouseEnter(post.slug)}
      onFocus={() => handleMouseEnter(post.slug)}
    >
      <div className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        <OptimizedImage
          src={post.cover_image}
          alt={`Imagem: ${post.title}`}
          aspectRatio="16/9"
          containerClassName={`w-full h-full ${showBlur ? 'blur-lg scale-110' : ''}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {showBlur && (
          <button
            className="absolute inset-0 bg-black/30 flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              onReveal();
            }}
          >
            <Eye size={16} className="text-white" />
          </button>
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
          {post.category}
        </span>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight mt-0.5">
          {post.title}
        </h3>
        <TimeAgo date={post.created_at} className="text-xs text-muted-foreground mt-1" />
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

  const mainPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);
  const gridPosts = posts.slice(3, 7);
  const mobilePosts = posts.slice(1, 5);

  return (
    <section className="container py-4 md:py-6">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
      </div>

      {/* Mobile Layout - Vertical Stack */}
      <div className="md:hidden">
        {/* Destaque Principal */}
        <MainCard 
          post={mainPost}
          isRevealed={revealedPosts.has(mainPost.id)}
          onReveal={() => revealPost(mainPost.id)}
          handleMouseEnter={handleMouseEnter}
        />

        {/* Lista de Notícias */}
        <div className="mt-4 bg-card rounded-lg border border-border px-3">
          {mobilePosts.map((post) => (
            <MobileListCard
              key={post.id}
              post={post}
              isRevealed={revealedPosts.has(post.id)}
              onReveal={() => revealPost(post.id)}
              handleMouseEnter={handleMouseEnter}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GloboStyleGrid;
