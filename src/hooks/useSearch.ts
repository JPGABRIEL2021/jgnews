import { useState, useMemo } from "react";
import { useSearchPosts } from "@/hooks/usePosts";
import { Post } from "@/lib/posts";

export const useSearch = () => {
  const [query, setQuery] = useState("");
  const isSearching = query.length >= 2;

  const { data: searchResults = [], isLoading } = useSearchPosts(query);

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const clearSearch = () => {
    setQuery("");
  };

  return {
    query,
    searchResults,
    isSearching,
    isLoading,
    handleSearch,
    clearSearch,
  };
};
