import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Post } from "@/lib/posts";

interface BreakingNewsBannerProps {
  news: Post[];
  onDismiss?: () => void;
}

const BreakingNewsBanner = ({ news, onDismiss }: BreakingNewsBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPulsing, setIsPulsing] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Stop pulsing after 10 seconds
    const timer = setTimeout(() => setIsPulsing(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate through breaking news every 5 seconds
  useEffect(() => {
    if (news.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [news.length]);

  if (!news || news.length === 0 || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const currentNews = news[currentIndex];

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
        <div className="flex items-center gap-2 py-2">
          {/* Breaking Badge */}
          <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded animate-pulse">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider whitespace-nowrap">
              Urgente
            </span>
          </div>

          {/* Navigation arrows - only show if more than 1 news */}
          {news.length > 1 && (
            <button
              onClick={goToPrevious}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Notícia anterior"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          
          {/* News Text - Clickable */}
          <Link 
            to={`/post/${currentNews.slug}`}
            className="flex-1 min-w-0 group"
          >
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate md:whitespace-normal group-hover:underline transition-all duration-300">
                {currentNews.title}
              </p>
            </div>
          </Link>

          {/* Navigation arrows - only show if more than 1 news */}
          {news.length > 1 && (
            <button
              onClick={goToNext}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Próxima notícia"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* Counter - only show if more than 1 news */}
          {news.length > 1 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded whitespace-nowrap">
              {currentIndex + 1}/{news.length}
            </span>
          )}
          
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
