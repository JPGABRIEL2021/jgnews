import { TrendingUp } from "lucide-react";
import { Post } from "@/data/mockPosts";
import NewsCard from "./NewsCard";

interface SidebarProps {
  posts: Post[];
}

const Sidebar = ({ posts }: SidebarProps) => {
  return (
    <aside className="lg:sticky lg:top-24 space-y-6">
      {/* Trending Section */}
      <div className="bg-news-subtle rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-news">
          <TrendingUp className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-news-primary">Mais Lidas</h2>
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
    </aside>
  );
};

export default Sidebar;
