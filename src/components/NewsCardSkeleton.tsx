import { cn } from "@/lib/utils";

interface NewsCardSkeletonProps {
  variant?: "horizontal" | "compact" | "hero";
}

const SkeletonPulse = ({ className }: { className?: string }) => (
  <div 
    className={cn(
      "bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-skeleton-wave rounded",
      className
    )} 
  />
);

const NewsCardSkeleton = ({ variant = "horizontal" }: NewsCardSkeletonProps) => {
  if (variant === "hero") {
    return (
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden bg-muted">
        <SkeletonPulse className="absolute inset-0" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 space-y-3">
          <SkeletonPulse className="h-5 w-20 rounded-full" />
          <SkeletonPulse className="h-8 md:h-10 w-full max-w-xl" />
          <SkeletonPulse className="h-8 md:h-10 w-3/4 max-w-lg" />
          <SkeletonPulse className="h-4 w-24" />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-3 py-3 border-b border-border last:border-b-0">
        <SkeletonPulse className="w-24 h-16 flex-shrink-0 rounded-lg" />
        <div className="flex flex-col justify-center min-w-0 flex-1 gap-2">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-2/3" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      {/* Thumbnail Skeleton */}
      <SkeletonPulse className="w-32 sm:w-40 md:w-48 h-24 sm:h-28 md:h-32 flex-shrink-0 rounded-lg" />

      {/* Content Skeleton */}
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-2.5">
        <div className="flex items-center gap-2">
          <SkeletonPulse className="h-5 w-20 rounded-full" />
          <SkeletonPulse className="h-3 w-16 hidden sm:block" />
        </div>
        <SkeletonPulse className="h-5 w-full" />
        <SkeletonPulse className="h-5 w-4/5" />
        <SkeletonPulse className="h-4 w-full hidden md:block" />
        <SkeletonPulse className="h-4 w-2/3 hidden md:block" />
      </div>
    </div>
  );
};

export default NewsCardSkeleton;
