import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface PostSource {
  name: string;
  url: string;
}

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
  is_sensitive: boolean;
  scheduled_at: string | null;
  sources: PostSource[];
  created_at: string;
  updated_at: string;
}

export type PostInsert = Omit<Post, "id" | "created_at" | "updated_at">;
export type PostUpdate = Partial<PostInsert>;

// Helper to parse sources from JSON
const parseSources = (sources: unknown): PostSource[] => {
  if (!sources || !Array.isArray(sources)) return [];
  return sources
    .filter((s): s is { name: unknown; url: unknown } => 
      typeof s === 'object' && 
      s !== null && 
      'name' in s && 
      'url' in s
    )
    .filter(s => typeof s.name === 'string' && typeof s.url === 'string')
    .map(s => ({ name: s.name as string, url: s.url as string }));
};

// Helper to transform DB row to Post
const transformPost = (row: Record<string, unknown>): Post => ({
  id: row.id as string,
  title: row.title as string,
  slug: row.slug as string,
  excerpt: row.excerpt as string,
  content: row.content as string,
  cover_image: row.cover_image as string,
  category: row.category as string,
  author: row.author as string | null,
  is_featured: row.is_featured as boolean,
  is_breaking: row.is_breaking as boolean,
  is_sensitive: row.is_sensitive as boolean,
  scheduled_at: row.scheduled_at as string | null,
  sources: parseSources(row.sources as Json),
  created_at: row.created_at as string,
  updated_at: row.updated_at as string,
});

// Fetch all posts (for admin - includes scheduled)
export const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(transformPost);
};

// Fetch published posts only (scheduled_at is null or in the past)
export const fetchPublishedPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(transformPost);
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
  return (data || []).map(transformPost);
};

// Fetch all breaking news (only published)
export const fetchBreakingNews = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("is_breaking", true)
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(transformPost);
};

// Fetch post by slug
export const fetchPostBySlug = async (slug: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? transformPost(data) : null;
};

// Fetch post by ID
export const fetchPostById = async (id: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? transformPost(data) : null;
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
  return (data || []).map(transformPost);
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
    posts: (data || []).map(transformPost),
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
  return (data || []).map(transformPost);
};

// Create post
export const createPost = async (post: PostInsert): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...post,
      sources: post.sources as unknown as Json,
    })
    .select()
    .single();

  if (error) throw error;
  return transformPost(data);
};

// Update post
export const updatePost = async (id: string, updates: PostUpdate): Promise<Post> => {
  const dbUpdates = {
    ...updates,
    sources: updates.sources ? (updates.sources as unknown as Json) : undefined,
  };
  
  const { data, error } = await supabase
    .from("posts")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return transformPost(data);
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
  "Brasil",
  "Saúde",
];
