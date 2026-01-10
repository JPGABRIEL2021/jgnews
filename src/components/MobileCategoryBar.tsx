import { Link, useLocation } from "react-router-dom";
import { 
  Landmark, 
  TrendingUp, 
  Cpu, 
  Trophy, 
  Heart, 
  Globe, 
  Film,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Destaques", slug: "", icon: Flame, color: "text-primary" },
  { name: "Política", slug: "politica", icon: Landmark, color: "text-blue-600" },
  { name: "Economia", slug: "economia", icon: TrendingUp, color: "text-amber-600" },
  { name: "Tecnologia", slug: "tecnologia", icon: Cpu, color: "text-cyan-600" },
  { name: "Esportes", slug: "esportes", icon: Trophy, color: "text-green-600" },
  { name: "Saúde", slug: "saude", icon: Heart, color: "text-rose-600" },
  { name: "Internacional", slug: "internacional", icon: Globe, color: "text-slate-600" },
  { name: "Entretenimento", slug: "entretenimento", icon: Film, color: "text-purple-600" },
];

const MobileCategoryBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (slug: string) => {
    if (slug === "" && currentPath === "/") return true;
    if (slug && currentPath === `/category/${slug}`) return true;
    return false;
  };

  return (
    <nav className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 px-3 py-2 min-w-max">
          {categories.map((category) => {
            const Icon = category.icon;
            const active = isActive(category.slug);
            
            return (
              <Link
                key={category.slug}
                to={category.slug ? `/category/${category.slug}` : "/"}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={14} className={cn(!active && category.color)} />
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileCategoryBar;
