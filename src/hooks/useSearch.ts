import { useState, useMemo, useCallback } from "react";
import { Post, mockPosts } from "@/data/mockPosts";

export const useSearch = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return mockPosts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
      const excerptMatch = post.excerpt.toLowerCase().includes(normalizedQuery);
      const contentMatch = post.content.toLowerCase().includes(normalizedQuery);
      const categoryMatch = post.category.toLowerCase().includes(normalizedQuery);
      
      return titleMatch || excerptMatch || contentMatch || categoryMatch;
    });
  }, [query]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setIsSearching(value.trim().length > 0);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setIsSearching(false);
  }, []);

  return {
    query,
    searchResults,
    isSearching,
    handleSearch,
    clearSearch,
  };
};
