import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { categories } from "@/lib/posts";
import { useCategoryPosts } from "@/hooks/usePosts";
import { 
  Landmark, 
  TrendingUp, 
  Dumbbell, 
  Cpu, 
  Clapperboard, 
  Globe, 
  MapPin, 
  Heart,
  ChevronRight
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  "Política": <Landmark className="w-8 h-8" />,
  "Economia": <TrendingUp className="w-8 h-8" />,
  "Esportes": <Dumbbell className="w-8 h-8" />,
  "Tecnologia": <Cpu className="w-8 h-8" />,
  "Entretenimento": <Clapperboard className="w-8 h-8" />,
  "Mundo": <Globe className="w-8 h-8" />,
  "Brasil": <MapPin className="w-8 h-8" />,
  "Saúde": <Heart className="w-8 h-8" />,
};

const categoryColors: Record<string, string> = {
  "Política": "from-blue-500 to-blue-600",
  "Economia": "from-emerald-500 to-emerald-600",
  "Esportes": "from-orange-500 to-orange-600",
  "Tecnologia": "from-purple-500 to-purple-600",
  "Entretenimento": "from-pink-500 to-pink-600",
  "Mundo": "from-cyan-500 to-cyan-600",
  "Brasil": "from-green-500 to-yellow-500",
  "Saúde": "from-red-500 to-red-600",
};

const CategoryCard = ({ category }: { category: string }) => {
  const { data: posts = [] } = useCategoryPosts(category);
  const postCount = posts.length;
  
  const icon = categoryIcons[category] || <Globe className="w-8 h-8" />;
  const gradient = categoryColors[category] || "from-gray-500 to-gray-600";

  return (
    <Link
      to={`/category/${encodeURIComponent(category)}`}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Gradient Header */}
      <div className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <div className="text-white opacity-90 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {category}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {postCount} {postCount === 1 ? "notícia" : "notícias"}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};

const CategoriesPage = () => {
  // Remove duplicates from categories
  const uniqueCategories = [...new Set(categories)];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Categorias"
        description="Explore todas as categorias de notícias do JG News. Política, Economia, Esportes, Tecnologia, Entretenimento, Mundo, Brasil e Saúde."
        keywords="categorias, notícias, política, economia, esportes, tecnologia, entretenimento, mundo, brasil, saúde"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container py-12">
            <h1 className="text-4xl md:text-5xl font-black text-foreground text-center">
              Todas as Categorias
            </h1>
            <p className="text-lg text-muted-foreground text-center mt-4 max-w-2xl mx-auto">
              Explore as notícias organizadas por tema. Escolha uma categoria para ver todas as matérias relacionadas.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uniqueCategories.map((category) => (
              <CategoryCard key={category} category={category} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
