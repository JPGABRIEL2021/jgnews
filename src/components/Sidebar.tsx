import { TrendingUp } from "lucide-react";
import { Post } from "@/lib/posts";
import NewsCard from "./NewsCard";
import NewsletterForm from "./NewsletterForm";
import AdBanner from "./AdBanner";

interface SidebarProps {
  posts: Post[];
}

const Sidebar = ({ posts }: SidebarProps) => {
  return (
    <aside className="lg:sticky lg:top-24 space-y-6">
      {/* Ad Banner - Top Sidebar */}
      <AdBanner format="rectangle" className="min-h-[250px] bg-muted/30 rounded-lg" />

      {/* Trending Section */}
      <div className="bg-news-subtle rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-news">
          <TrendingUp className="text-primary" size={20} />
          <h4 className="text-lg font-bold text-news-primary">Mais Lidas</h4>
        </div>
        <div>
          {posts.slice(0, 5).map((post, index) => (
            <div key={post.id} className="flex gap-3 items-start">
              <span className="text-3xl font-black text-primary/20 leading-none">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <NewsCard post={post} variant="compact" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Banner - Middle Sidebar */}
      <AdBanner format="rectangle" className="min-h-[250px] bg-muted/30 rounded-lg" />

      {/* Newsletter Section */}
      <NewsletterForm />

      {/* Ad Banner - Bottom Sidebar */}
      <AdBanner format="vertical" className="min-h-[600px] bg-muted/30 rounded-lg" />
    </aside>
  );
};

export default Sidebar;
