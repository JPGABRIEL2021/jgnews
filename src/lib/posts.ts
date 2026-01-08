import { supabase } from "@/integrations/supabase/client";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author: string | null;
  is_featured: boolean;
  is_breaking: boolean;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PostInsert = Omit<Post, "id" | "created_at" | "updated_at">;
export type PostUpdate = Partial<PostInsert>;

// Fetch all posts (for admin - includes scheduled)
export const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch published posts only (scheduled_at is null or in the past)
export const fetchPublishedPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch featured posts (only published)
export const fetchFeaturedPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("is_featured", true)
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return data || [];
};

// Fetch breaking news (only published)
export const fetchBreakingNews = async (): Promise<Post | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("is_breaking", true)
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Fetch post by slug
export const fetchPostBySlug = async (slug: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Fetch post by ID
export const fetchPostById = async (id: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Fetch posts by category (only published)
export const fetchPostsByCategory = async (category: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .ilike("category", category)
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch paginated posts (only published)
export const fetchPaginatedPosts = async (
  page: number,
  limit: number,
  excludeFeatured = true,
  excludeBreaking = true
): Promise<{ posts: Post[]; hasMore: boolean }> => {
  let query = supabase
    .from("posts")
    .select("*")
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (excludeFeatured) {
    query = query.eq("is_featured", false);
  }
  if (excludeBreaking) {
    query = query.eq("is_breaking", false);
  }

  const { data, error } = await query.range(
    (page - 1) * limit,
    page * limit
  );

  if (error) throw error;

  return {
    posts: data || [],
    hasMore: (data?.length || 0) > limit,
  };
};

// Search posts (only published)
export const searchPosts = async (query: string): Promise<Post[]> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`)
    .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
};

// Create post
export const createPost = async (post: PostInsert): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update post
export const updatePost = async (id: string, updates: PostUpdate): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete post
export const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Toggle featured
export const toggleFeatured = async (id: string, isFeatured: boolean): Promise<Post> => {
  return updatePost(id, { is_featured: isFeatured });
};

// Toggle breaking
export const toggleBreaking = async (id: string, isBreaking: boolean): Promise<Post> => {
  // First, if setting as breaking, clear other breaking posts
  if (isBreaking) {
    await supabase
      .from("posts")
      .update({ is_breaking: false })
      .eq("is_breaking", true);
  }
  return updatePost(id, { is_breaking: isBreaking });
};

// Categories list
export const categories = [
  "Política",
  "Economia",
  "Esportes",
  "Tecnologia",
  "Entretenimento",
  "Mundo",
  "Brasil"
];
