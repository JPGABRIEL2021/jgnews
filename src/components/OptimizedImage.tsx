import { useState, useRef, useEffect, ImgHTMLAttributes, useMemo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  containerClassName?: string;
  width?: number;
  quality?: number;
}

const OptimizedImage = ({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  aspectRatio,
  containerClassName,
  className,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the original source directly - browser handles format negotiation
  const imageSrc = useMemo(() => {
    if (hasError) return fallbackSrc;
    return src;
  }, [src, hasError, fallbackSrc]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  // Default aspect ratio for CLS optimization
  const defaultAspectRatio = aspectRatio || "16/9";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        containerClassName
      )}
      style={{ aspectRatio: defaultAspectRatio }}
    >
      {/* Placeholder skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}
      
      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          // Add fetchpriority for LCP images (when they're visible immediately)
          fetchPriority={props.fetchPriority}
          className={cn(
            "transition-opacity duration-500 ease-out w-full h-full object-cover",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
