import { Skeleton } from "@/components/ui/skeleton";

const HeroGridSkeleton = () => {
  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Article Skeleton */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-lg">
          <div className="aspect-[16/9] lg:aspect-[16/10]">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2 hidden sm:block" />
            <Skeleton className="h-4 w-2/3 hidden sm:block" />
            <Skeleton className="h-3 w-20 mt-3" />
          </div>
        </div>

        {/* Side Articles Skeleton */}
        <div className="flex flex-col gap-4">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg flex-1"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="h-full min-h-[200px]">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-16 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroGridSkeleton;
