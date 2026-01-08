import { Skeleton } from "@/components/ui/skeleton";

interface NewsCardSkeletonProps {
  variant?: "horizontal" | "compact";
}

const NewsCardSkeleton = ({ variant = "horizontal" }: NewsCardSkeletonProps) => {
  if (variant === "compact") {
    return (
      <div className="flex gap-3 py-3 border-b border-news last:border-b-0 animate-pulse">
        <Skeleton className="w-24 h-16 flex-shrink-0 rounded" />
        <div className="flex flex-col justify-center min-w-0 flex-1 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 py-4 border-b border-news animate-pulse">
      {/* Thumbnail Skeleton */}
      <Skeleton className="w-32 sm:w-40 md:w-48 h-24 sm:h-28 md:h-32 flex-shrink-0 rounded-lg" />

      {/* Content Skeleton */}
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-16 hidden sm:block" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full hidden md:block" />
        <Skeleton className="h-4 w-2/3 hidden md:block" />
      </div>
    </div>
  );
};

export default NewsCardSkeleton;
