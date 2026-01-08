import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Calendar, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import NewsCard from "@/components/NewsCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePosts } from "@/hooks/usePosts";
import { categories } from "@/lib/posts";
import { format, subDays, subMonths, isAfter, parseISO } from "date-fns";

type DateFilter = "all" | "today" | "week" | "month" | "year";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: allPosts = [], isLoading } = usePosts();

  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (post) => post.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      let cutoffDate: Date;

      switch (dateFilter) {
        case "today":
          cutoffDate = subDays(now, 1);
          break;
        case "week":
          cutoffDate = subDays(now, 7);
          break;
        case "month":
          cutoffDate = subMonths(now, 1);
          break;
        case "year":
          cutoffDate = subMonths(now, 12);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter((post) =>
        isAfter(parseISO(post.created_at), cutoffDate)
      );
    }

    return filtered;
  }, [allPosts, searchQuery, selectedCategory, dateFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setDateFilter("all");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || dateFilter !== "all";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Buscar Notícias"
        description="Pesquise notícias no JG News. Encontre artigos por palavras-chave, categoria ou data de publicação."
        keywords="busca, pesquisa, notícias, filtros, categorias"
      />
      <Header />

      <main className="flex-1">
        {/* Search Header */}
        <div className="bg-news-subtle border-b border-news">
          <div className="container py-8">
            <h1 className="text-3xl md:text-4xl font-black text-news-primary mb-6">
              Buscar Notícias
            </h1>

            {/* Search Input */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-news-muted" size={20} />
              <Input
                type="search"
                placeholder="Digite sua busca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-background border-news focus-visible:ring-primary"
              />
            </div>

            {/* Toggle Filters Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="mt-4"
            >
              <Filter size={18} className="mr-2" />
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 p-6 bg-background rounded-lg border border-news animate-fade-in">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Período</Label>
                    <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                      <SelectTrigger id="date">
                        <Calendar size={16} className="mr-2" />
                        <SelectValue placeholder="Qualquer data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Qualquer data</SelectItem>
                        <SelectItem value="today">Últimas 24 horas</SelectItem>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mês</SelectItem>
                        <SelectItem value="year">Último ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className="w-full sm:w-auto"
                    >
                      <X size={16} className="mr-2" />
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container py-8">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-news-muted">
              {isLoading ? (
                "Carregando..."
              ) : (
                <>
                  <span className="font-bold text-news-primary">{filteredPosts.length}</span>{" "}
                  {filteredPosts.length === 1 ? "resultado encontrado" : "resultados encontrados"}
                </>
              )}
            </p>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm text-news-muted">
                <span>Filtros ativos:</span>
                {searchQuery && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                    "{searchQuery}"
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded capitalize">
                    {selectedCategory}
                  </span>
                )}
                {dateFilter !== "all" && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                    {dateFilter === "today" && "24h"}
                    {dateFilter === "week" && "7 dias"}
                    {dateFilter === "month" && "30 dias"}
                    {dateFilter === "year" && "1 ano"}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner text="Buscando notícias..." />
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="divide-y divide-news">
              {filteredPosts.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-news-subtle flex items-center justify-center">
                <Search size={32} className="text-news-muted" />
              </div>
              <h2 className="text-xl font-bold text-news-primary mb-2">
                Nenhum resultado encontrado
              </h2>
              <p className="text-news-muted mb-6">
                {searchQuery
                  ? `Não encontramos notícias para "${searchQuery}"`
                  : "Tente ajustar os filtros para encontrar o que procura"}
              </p>
              <Button onClick={clearFilters} variant="outline">
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
