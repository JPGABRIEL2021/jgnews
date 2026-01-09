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

// Cloudinary cloud name from environment
const CLOUDINARY_CLOUD_NAME = "dxlduqbwv";

/**
 * Generate Cloudinary fetch URL for automatic WebP/AVIF conversion
 * Uses Cloudinary's fetch mode to optimize external images
 */
const getCloudinaryUrl = (
  src: string,
  width?: number,
  quality: number = 80
): string => {
  // Skip if already a Cloudinary URL, placeholder, or data URL
  if (
    !src ||
    src.includes("cloudinary.com") ||
    src.startsWith("/") ||
    src.startsWith("data:")
  ) {
    return src;
  }

  // Validate URL
  try {
    new URL(src);
  } catch {
    return src;
  }

  // Build Cloudinary transformations
  const transformations = [
    "f_auto", // Auto format (WebP/AVIF based on browser support)
    `q_${quality}`, // Quality
    width ? `w_${width}` : "w_auto", // Width
    "c_limit", // Don't upscale
    "dpr_auto", // Auto DPR for retina
  ].join(",");

  // Use Cloudinary fetch mode to optimize external URLs
  const encodedUrl = encodeURIComponent(src);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformations}/${encodedUrl}`;
};

const OptimizedImage = ({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  aspectRatio,
  containerClassName,
  className,
  width,
  quality = 80,
  ...props
}: OptimizedImageProps) => {
  // For high priority images (like article covers), load immediately
  const isHighPriority = props.fetchPriority === "high";
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(isHighPriority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate optimized Cloudinary URL
  const imageSrc = useMemo(() => {
    if (hasError) return fallbackSrc;
    return getCloudinaryUrl(src, width, quality);
  }, [src, width, quality, hasError, fallbackSrc]);

  // Fallback to original if Cloudinary fails
  const handleCloudinaryError = () => {
    if (!hasError && imageSrc !== src && imageSrc !== fallbackSrc) {
      // Try original URL before giving up
      setHasError(false);
      return src;
    }
    return fallbackSrc;
  };

  useEffect(() => {
    // Skip observer for high priority images - they load immediately
    if (isHighPriority) {
      setIsInView(true);
      return;
    }

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
  }, [isHighPriority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  
  useEffect(() => {
    setCurrentSrc(imageSrc);
    setIsLoaded(false);
    setHasError(false);
  }, [imageSrc]);

  const handleError = () => {
    if (!hasError) {
      // If Cloudinary URL failed, try original
      if (currentSrc !== src && currentSrc !== fallbackSrc) {
        setCurrentSrc(src);
      } else {
        setHasError(true);
        setCurrentSrc(fallbackSrc);
        setIsLoaded(true);
      }
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
      {isInView && currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
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
