import { useState, useCallback } from "react";
import Header from "@/components/Header";
import HeroGrid from "@/components/HeroGrid";
import HeroGridSkeleton from "@/components/HeroGridSkeleton";
import NewsFeedInfinite from "@/components/NewsFeedInfinite";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import BreakingNewsBanner from "@/components/BreakingNewsBanner";
import NewsCardSkeleton from "@/components/NewsCardSkeleton";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import SEO from "@/components/SEO";
import { CookieConsent } from "@/components/CookieConsent";
import HealthNewsSection from "@/components/HealthNewsSection";
import TechNewsSection from "@/components/TechNewsSection";
import SportsNewsSection from "@/components/SportsNewsSection";
import MarketTicker from "@/components/MarketTicker";
import MostReadSection from "@/components/MostReadSection";
import AdBanner from "@/components/AdBanner";
import { useFeaturedPosts, usePosts, useBreakingNews, usePostsRealtime } from "@/hooks/usePosts";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Index = () => {
  const [showBreaking, setShowBreaking] = useState(true);
  const queryClient = useQueryClient();
  
  // Enable realtime updates
  usePostsRealtime();

  const { data: featuredPosts = [], isLoading: loadingFeatured } = useFeaturedPosts();
  const { data: allPosts = [], isLoading: loadingPosts } = usePosts();
  const { data: breakingNews = [] } = useBreakingNews();

  const nonFeaturedPosts = allPosts.filter(post => !post.is_featured && !post.is_breaking);
  const isLoading = loadingFeatured || loadingPosts;

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["posts"] });
    await queryClient.invalidateQueries({ queryKey: ["featured-posts"] });
    await queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
    toast.success("Notícias atualizadas!");
  }, [queryClient]);

  const { containerRef, pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-background">
      <SEO />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        progress={progress}
      />

      {/* Breaking News Banner */}
      {showBreaking && breakingNews.length > 0 && (
        <BreakingNewsBanner 
          news={breakingNews} 
          onDismiss={() => setShowBreaking(false)} 
        />
      )}
      
      <Header />

      {/* Market Ticker */}
      <MarketTicker />
      
      <main className="flex-1">
        {/* Hero Section */}
        {isLoading ? (
          <HeroGridSkeleton />
        ) : featuredPosts.length >= 3 ? (
          <HeroGrid posts={featuredPosts} />
        ) : featuredPosts.length > 0 ? (
          <div className="container py-6">
            <p className="text-news-muted text-center">
              Marque pelo menos 3 notícias como destaque para exibir o Hero Grid
            </p>
          </div>
        ) : null}

        {/* Ad Banner - Below Hero */}
        <div className="container py-4">
          <AdBanner format="horizontal" className="min-h-[90px] bg-muted/30 rounded-lg" />
        </div>

        {/* Most Read Section */}
        <MostReadSection />

        {/* Health News Section */}
        <HealthNewsSection />

        {/* Ad Banner - Between Sections */}
        <div className="container py-4">
          <AdBanner format="horizontal" className="min-h-[90px] bg-muted/30 rounded-lg" />
        </div>

        {/* Tech News Section */}
        <TechNewsSection />

        {/* Sports News Section */}
        <SportsNewsSection />

        {/* Content Grid */}
        <div className="container pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="space-y-0">
                  {[...Array(5)].map((_, i) => (
                    <NewsCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <NewsFeedInfinite posts={nonFeaturedPosts} />
              )}
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <Sidebar posts={allPosts} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
};

export default Index;
