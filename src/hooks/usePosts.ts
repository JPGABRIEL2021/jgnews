import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPosts,
  fetchFeaturedPosts,
  fetchBreakingNews,
  fetchPostBySlug,
  fetchPostById,
  fetchPostsByCategory,
  searchPosts,
  createPost,
  updatePost,
  deletePost,
  toggleFeatured,
  toggleBreaking,
  Post,
  PostInsert,
  PostUpdate,
} from "@/lib/posts";
import { toast } from "sonner";

// Hook to subscribe to realtime updates
export const usePostsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("Realtime update:", payload);
          
          // Invalidate all post-related queries
          queryClient.invalidateQueries({ queryKey: ["posts"] });
          queryClient.invalidateQueries({ queryKey: ["featured-posts"] });
          queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
          queryClient.invalidateQueries({ queryKey: ["post"] });
          queryClient.invalidateQueries({ queryKey: ["category-posts"] });

          // Show toast for breaking news
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newPost = payload.new as Post;
            if (newPost.is_breaking) {
              toast.error("🚨 URGENTE: " + newPost.title, {
                duration: 10000,
                action: {
                  label: "Ver",
                  onClick: () => {
                    window.location.href = `/post/${newPost.slug}`;
                  },
                },
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

// Fetch all posts
export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
};

// Fetch featured posts
export const useFeaturedPosts = () => {
  return useQuery({
    queryKey: ["featured-posts"],
    queryFn: fetchFeaturedPosts,
  });
};

// Fetch breaking news
export const useBreakingNews = () => {
  return useQuery({
    queryKey: ["breaking-news"],
    queryFn: fetchBreakingNews,
  });
};

// Fetch post by slug
export const usePost = (slug: string) => {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
  });
};

// Fetch post by ID
export const usePostById = (id: string) => {
  return useQuery({
    queryKey: ["post-by-id", id],
    queryFn: () => fetchPostById(id),
    enabled: !!id,
  });
};

// Fetch posts by category
export const useCategoryPosts = (category: string) => {
  return useQuery({
    queryKey: ["category-posts", category],
    queryFn: () => fetchPostsByCategory(category),
    enabled: !!category,
  });
};

// Search posts
export const useSearchPosts = (query: string) => {
  return useQuery({
    queryKey: ["search-posts", query],
    queryFn: () => searchPosts(query),
    enabled: query.length >= 2,
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: PostInsert) => createPost(post),
    onSuccess: (createdPost) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Notícia criada com sucesso!");
      return createdPost;
    },
    onError: (error) => {
      toast.error("Erro ao criar notícia: " + error.message);
    },
  });
};

// Update post mutation
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PostUpdate }) =>
      updatePost(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Notícia atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar notícia: " + error.message);
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Notícia excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir notícia: " + error.message);
    },
  });
};

// Toggle featured mutation
export const useToggleFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      toggleFeatured(id, isFeatured),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["featured-posts"] });
      toast.success(
        variables.isFeatured
          ? "Notícia marcada como destaque!"
          : "Notícia removida dos destaques"
      );
    },
    onError: (error) => {
      toast.error("Erro ao atualizar destaque: " + error.message);
    },
  });
};

// Toggle breaking mutation
export const useToggleBreaking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isBreaking, postTitle, postSlug, postCategory }: { 
      id: string; 
      isBreaking: boolean;
      postTitle?: string;
      postSlug?: string;
      postCategory?: string;
    }) => {
      const result = await toggleBreaking(id, isBreaking);
      
      // Send push notification when marking as breaking news
      if (isBreaking && postTitle) {
        try {
          console.log("Sending push notification for breaking news:", postTitle, "category:", postCategory);
          await supabase.functions.invoke("send-push-notification", {
            body: {
              title: "🚨 URGENTE",
              body: postTitle,
              url: postSlug ? `/post/${postSlug}` : "/",
              icon: "/pwa-192x192.png",
              category: postCategory, // Filter by category preferences
            },
          });
          console.log("Push notification sent successfully");
        } catch (error) {
          console.error("Error sending push notification:", error);
          // Don't throw - breaking news toggle should still work even if push fails
        }
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
      toast.success(
        variables.isBreaking
          ? "🚨 Notícia marcada como URGENTE!"
          : "Notícia removida das urgentes"
      );
    },
    onError: (error) => {
      toast.error("Erro ao atualizar urgente: " + error.message);
    },
  });
};
