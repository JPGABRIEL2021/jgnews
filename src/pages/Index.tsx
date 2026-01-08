import { useState } from "react";
import Header from "@/components/Header";
import HeroGrid from "@/components/HeroGrid";
import NewsFeedInfinite from "@/components/NewsFeedInfinite";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import BreakingNewsBanner from "@/components/BreakingNewsBanner";
import { getFeaturedPosts, getLatestPosts, getBreakingNews } from "@/data/mockPosts";

const Index = () => {
  const [showBreaking, setShowBreaking] = useState(true);
  const featuredPosts = getFeaturedPosts();
  const latestPosts = getLatestPosts();
  const breakingNews = getBreakingNews();
  const nonFeaturedPosts = latestPosts.filter(post => !post.is_featured && !post.is_breaking);

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
        <HeroGrid posts={featuredPosts} />

        {/* Content Grid */}
        <div className="container pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <NewsFeedInfinite posts={nonFeaturedPosts} />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <Sidebar posts={latestPosts} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
