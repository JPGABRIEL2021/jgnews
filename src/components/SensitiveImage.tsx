import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";
import { cn } from "@/lib/utils";

interface SensitiveImageProps {
  src: string;
  alt: string;
  isSensitive?: boolean;
  aspectRatio?: string;
  containerClassName?: string;
  className?: string;
  fetchPriority?: "high" | "low" | "auto";
}

const SensitiveImage = ({
  src,
  alt,
  isSensitive = false,
  aspectRatio = "16/9",
  containerClassName,
  className,
  fetchPriority,
}: SensitiveImageProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // If not sensitive or already revealed, show normal image
  if (!isSensitive || isRevealed) {
    return (
      <OptimizedImage
        src={src}
        alt={alt}
        aspectRatio={aspectRatio}
        containerClassName={containerClassName}
        className={className}
        fetchPriority={fetchPriority}
      />
    );
  }

  // Sensitive image with blur overlay
  return (
    <div className={cn("relative overflow-hidden", containerClassName)} style={{ aspectRatio }}>
      {/* Blurred image */}
      <OptimizedImage
        src={src}
        alt={alt}
        aspectRatio={aspectRatio}
        containerClassName="blur-xl scale-110"
        className={className}
      />
      
      {/* Overlay with button */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
        <div className="text-center text-white px-4">
          <p className="text-sm font-medium mb-1">Conteúdo sensível</p>
          <p className="text-xs opacity-80">Esta imagem pode conter conteúdo sensível</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsRevealed(true)}
          className="gap-2"
        >
          <Eye size={16} />
          Ver imagem
        </Button>
      </div>
    </div>
  );
};

export default SensitiveImage;
