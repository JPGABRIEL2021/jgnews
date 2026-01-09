import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchPostBySlug } from "@/lib/posts";

/**
 * Hook for prefetching article data on hover/focus
 * Improves perceived performance by loading data before navigation
 */
export const usePrefetchPost = () => {
  const queryClient = useQueryClient();

  const prefetchPost = useCallback(
    (slug: string) => {
      // Only prefetch if not already cached
      const cached = queryClient.getQueryData(["post", slug]);
      if (cached) return;

      queryClient.prefetchQuery({
        queryKey: ["post", slug],
        queryFn: () => fetchPostBySlug(slug),
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    },
    [queryClient]
  );

  return { prefetchPost };
};

/**
 * Prefetch link on hover - adds to any link element
 */
export const useLinkPrefetch = () => {
  const { prefetchPost } = usePrefetchPost();

  const handleMouseEnter = useCallback(
    (slug: string) => {
      // Use requestIdleCallback for non-blocking prefetch
      if ("requestIdleCallback" in window) {
        (window as Window).requestIdleCallback(() => prefetchPost(slug));
      } else {
        setTimeout(() => prefetchPost(slug), 100);
      }
    },
    [prefetchPost]
  );

  return { handleMouseEnter };
};
