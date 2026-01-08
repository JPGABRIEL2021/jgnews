import { useState, useEffect, useCallback, useRef } from "react";
import { Post } from "@/lib/posts";

interface UseInfiniteScrollOptions {
  posts: Post[];
  postsPerPage?: number;
  isLoading?: boolean;
}

export const useInfiniteScroll = ({ 
  posts, 
  postsPerPage = 5,
  isLoading: externalLoading = false
}: UseInfiniteScrollOptions) => {
  const [displayCount, setDisplayCount] = useState(postsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const displayedPosts = posts.slice(0, displayCount);
  const hasMore = displayCount < posts.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore || externalLoading) return;

    setIsLoading(true);
    
    // Simulate network delay for smooth UX
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + postsPerPage, posts.length));
      setIsLoading(false);
    }, 300);
  }, [posts.length, postsPerPage, isLoading, hasMore, externalLoading]);

  // Reset when posts change
  useEffect(() => {
    setDisplayCount(postsPerPage);
  }, [posts, postsPerPage]);

  // Intersection Observer setup
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !externalLoading) {
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
  }, [loadMore, hasMore, isLoading, externalLoading]);

  return {
    displayedPosts,
    hasMore,
    isLoading: isLoading || externalLoading,
    loadMoreRef,
  };
};
