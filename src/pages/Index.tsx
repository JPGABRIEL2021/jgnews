import Header from "@/components/Header";
import HeroGrid from "@/components/HeroGrid";
import NewsFeed from "@/components/NewsFeed";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { getFeaturedPosts, getLatestPosts } from "@/data/mockPosts";

const Index = () => {
  const featuredPosts = getFeaturedPosts();
  const latestPosts = getLatestPosts();
  const nonFeaturedPosts = latestPosts.filter(post => !post.is_featured);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroGrid posts={featuredPosts} />

        {/* Content Grid */}
        <div className="container pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <NewsFeed posts={nonFeaturedPosts} />
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
