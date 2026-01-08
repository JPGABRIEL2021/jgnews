import { useState, useEffect, useCallback, useRef } from "react";
import { Post } from "@/data/mockPosts";

interface UseInfiniteScrollOptions {
  initialPosts: Post[];
  postsPerPage?: number;
}

export const useInfiniteScroll = ({ 
  initialPosts, 
  postsPerPage = 5 
}: UseInfiniteScrollOptions) => {
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Initialize with first batch
  useEffect(() => {
    const initialBatch = initialPosts.slice(0, postsPerPage);
    setDisplayedPosts(initialBatch);
    setHasMore(initialPosts.length > postsPerPage);
  }, [initialPosts, postsPerPage]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simulate network delay for smooth UX
    setTimeout(() => {
      const nextPage = page + 1;
      const start = 0;
      const end = nextPage * postsPerPage;
      const newPosts = initialPosts.slice(start, end);
      
      setDisplayedPosts(newPosts);
      setPage(nextPage);
      setHasMore(end < initialPosts.length);
      setIsLoading(false);
    }, 300);
  }, [initialPosts, page, postsPerPage, isLoading, hasMore]);

  // Intersection Observer setup
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoading]);

  return {
    displayedPosts,
    hasMore,
    isLoading,
    loadMoreRef,
  };
};
