import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsFeed from "@/components/NewsFeed";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCategoryPosts, usePosts, usePostsRealtime } from "@/hooks/usePosts";
import { categories } from "@/lib/posts";

const CategoryPage = () => {
  const { name } = useParams<{ name: string }>();
  
  // Enable realtime updates
  usePostsRealtime();
  
  // Find the proper category name (case insensitive match)
  const categoryName = categories.find(
    cat => cat.toLowerCase() === name?.toLowerCase()
  ) || name || "";

  const { data: categoryPosts = [], isLoading } = useCategoryPosts(categoryName);
  const { data: allPosts = [] } = usePosts();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner text="Carregando notícias..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Category Header */}
        <div className="bg-news-subtle border-b border-news">
          <div className="container py-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-news-muted hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Voltar para início
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-news-primary">
              {categoryName}
            </h1>
            <p className="text-news-muted mt-2">
              {categoryPosts.length} {categoryPosts.length === 1 ? "notícia encontrada" : "notícias encontradas"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container py-8">
          {categoryPosts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <NewsFeed posts={categoryPosts} title={`Notícias de ${categoryName}`} />
              </div>
              <div className="hidden lg:block">
                <Sidebar posts={allPosts} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-news-muted text-lg mb-4">
                Nenhuma notícia encontrada nesta categoria.
              </p>
              <Link to="/" className="text-primary hover:underline">
                Ver todas as notícias
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
