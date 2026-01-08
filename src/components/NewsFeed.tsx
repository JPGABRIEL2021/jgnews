import { Post } from "@/lib/posts";
import NewsCard from "./NewsCard";

interface NewsFeedProps {
  posts: Post[];
  title?: string;
}

const NewsFeed = ({ posts, title = "Últimas Notícias" }: NewsFeedProps) => {
  return (
    <section className="py-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary">
        <h2 className="text-xl font-bold text-news-primary">{title}</h2>
        <div className="flex-1 h-px bg-news-border" />
      </div>
      <div className="divide-y divide-news">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default NewsFeed;
