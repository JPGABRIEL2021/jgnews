import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { categories } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";
import SearchResults from "./SearchResults";
import { PushNotificationButton } from "./PushNotificationButton";
import WeatherWidget from "./WeatherWidget";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { query, searchResults, isSearching, isLoading, handleSearch, clearSearch } = useSearch();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCloseSearch = () => {
    setSearchOpen(false);
    clearSearch();
  };

  const handleToggleSearch = () => {
    if (searchOpen) {
      handleCloseSearch();
    } else {
      setSearchOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-news shadow-sm">
      <div className="container">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-2xl md:text-3xl font-black text-primary">JG</span>
              <span className="text-2xl md:text-3xl font-black text-news-primary ml-1">News</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category}
                to={`/category/${category.toLowerCase()}`}
                className="text-sm font-medium text-news-secondary hover:text-primary transition-colors"
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Push Notifications */}
            <PushNotificationButton />

            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleSearch}
              className="text-news-muted hover:text-primary"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-news-muted hover:text-primary">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <span className="text-primary font-black">JG</span>
                    <span className="font-black ml-1">News</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  <Link
                    to="/"
                    className="px-4 py-3 text-base font-medium text-news-secondary hover:bg-secondary rounded-lg transition-colors"
                  >
                    Início
                  </Link>
                  <Link
                    to="/busca"
                    className="px-4 py-3 text-base font-medium text-news-secondary hover:bg-secondary rounded-lg transition-colors"
                  >
                    🔍 Busca Avançada
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/category/${category.toLowerCase()}`}
                      className="px-4 py-3 text-base font-medium text-news-secondary hover:bg-secondary rounded-lg transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {searchOpen && (
          <div className="pb-4 animate-fade-in relative" ref={searchContainerRef}>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-news-muted" size={18} />
              <Input
                type="search"
                placeholder="Buscar notícias..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11 bg-secondary border-none focus-visible:ring-primary"
                autoFocus
              />
              
              {/* Search Results Dropdown */}
              <SearchResults
                results={searchResults}
                query={query}
                onClose={handleCloseSearch}
                isVisible={isSearching}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Weather Widget (Mobile) */}
        <div className="flex md:hidden items-center justify-center py-2 border-t border-news">
          <WeatherWidget />
        </div>

        {/* Category Bar (Desktop) */}
        <div className="hidden md:flex items-center justify-between py-2 border-t border-news">
          <div className="flex items-center gap-1 overflow-x-auto">
            <Link
              to="/"
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-news-muted hover:text-primary transition-colors whitespace-nowrap"
            >
              Início
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/category/${category.toLowerCase()}`}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-news-muted hover:text-primary transition-colors whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </div>
          
          {/* Weather Widget (Desktop) */}
          <div className="shrink-0 ml-4">
            <WeatherWidget />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
