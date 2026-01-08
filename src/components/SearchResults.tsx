import { Post } from "@/data/mockPosts";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import TimeAgo from "./TimeAgo";

interface SearchResultsProps {
  results: Post[];
  query: string;
  onClose: () => void;
  isVisible: boolean;
}

const SearchResults = ({ results, query, onClose, isVisible }: SearchResultsProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-background border border-news rounded-lg shadow-lg mt-2 max-h-[70vh] overflow-y-auto z-50 animate-fade-in">
      <div className="sticky top-0 bg-background border-b border-news p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-news-muted">
          <Search size={14} />
          <span>
            {results.length} {results.length === 1 ? "resultado" : "resultados"} para "{query}"
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-secondary rounded transition-colors"
          aria-label="Fechar busca"
        >
          <X size={16} className="text-news-muted" />
        </button>
      </div>

      {results.length > 0 ? (
        <div className="divide-y divide-news">
          {results.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              onClick={onClose}
              className="flex gap-3 p-3 hover:bg-secondary transition-colors group"
            >
              <div className="w-20 h-14 flex-shrink-0 overflow-hidden rounded">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CategoryBadge category={post.category} size="sm" clickable={false} />
                  <TimeAgo date={post.created_at} className="text-xs" />
                </div>
                <h4 className="text-sm font-semibold text-news-primary line-clamp-2 group-hover:text-primary transition-colors">
                  {highlightMatch(post.title, query)}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <Search size={32} className="mx-auto text-news-muted/30 mb-3" />
          <p className="text-news-muted">Nenhum resultado encontrado</p>
          <p className="text-sm text-news-muted/70 mt-1">
            Tente buscar por outras palavras
          </p>
        </div>
      )}
    </div>
  );
};

// Helper to highlight matching text
const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-primary/20 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const escapeRegex = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export default SearchResults;
