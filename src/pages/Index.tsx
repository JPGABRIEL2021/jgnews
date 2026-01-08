import { useState } from "react";
import Header from "@/components/Header";
import HeroGrid from "@/components/HeroGrid";
import NewsFeedInfinite from "@/components/NewsFeedInfinite";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import BreakingNewsBanner from "@/components/BreakingNewsBanner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useFeaturedPosts, usePosts, useBreakingNews, usePostsRealtime } from "@/hooks/usePosts";

const Index = () => {
  const [showBreaking, setShowBreaking] = useState(true);
  
  // Enable realtime updates
  usePostsRealtime();

  const { data: featuredPosts = [], isLoading: loadingFeatured } = useFeaturedPosts();
  const { data: allPosts = [], isLoading: loadingPosts } = usePosts();
  const { data: breakingNews } = useBreakingNews();

  const nonFeaturedPosts = allPosts.filter(post => !post.is_featured && !post.is_breaking);

  if (loadingFeatured || loadingPosts) {
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
      {/* Breaking News Banner */}
      {showBreaking && breakingNews && (
        <BreakingNewsBanner 
          news={breakingNews} 
          onDismiss={() => setShowBreaking(false)} 
        />
      )}
      
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        {featuredPosts.length >= 3 ? (
          <HeroGrid posts={featuredPosts} />
        ) : featuredPosts.length > 0 ? (
          <div className="container py-6">
            <p className="text-news-muted text-center">
              Marque pelo menos 3 notícias como destaque para exibir o Hero Grid
            </p>
          </div>
        ) : null}

        {/* Content Grid */}
        <div className="container pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <NewsFeedInfinite posts={nonFeaturedPosts} />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <Sidebar posts={allPosts} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
