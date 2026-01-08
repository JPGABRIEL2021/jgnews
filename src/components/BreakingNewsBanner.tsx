import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { Post } from "@/data/mockPosts";

interface BreakingNewsBannerProps {
  news: Post | null;
  onDismiss?: () => void;
}

const BreakingNewsBanner = ({ news, onDismiss }: BreakingNewsBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    // Stop pulsing after 10 seconds
    const timer = setTimeout(() => setIsPulsing(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!news || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div 
      className={`bg-primary text-primary-foreground relative overflow-hidden ${
        isPulsing ? "animate-pulse-slow" : ""
      }`}
    >
      {/* Animated background stripes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="breaking-news-stripes" />
      </div>
      
      <div className="container relative z-10">
        <div className="flex items-center gap-3 py-2">
          {/* Breaking Badge */}
          <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded animate-pulse">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider whitespace-nowrap">
              Urgente
            </span>
          </div>
          
          {/* News Text - Scrolling on mobile */}
          <Link 
            to={`/post/${news.slug}`}
            className="flex-1 min-w-0 group"
          >
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate md:whitespace-normal group-hover:underline">
                {news.title}
              </p>
            </div>
          </Link>
          
          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Fechar notícia urgente"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsBanner;
