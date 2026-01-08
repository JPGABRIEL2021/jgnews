import { Link } from "react-router-dom";

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

const CategoryBadge = ({ category, size = "sm", clickable = true }: CategoryBadgeProps) => {
  const getCategoryClass = (cat: string) => {
    const normalizedCategory = cat.toLowerCase();
    switch (normalizedCategory) {
      case "política":
        return "category-badge-politics";
      case "esportes":
        return "category-badge-sports";
      case "tecnologia":
        return "category-badge-tech";
      case "economia":
        return "category-badge-economy";
      case "entretenimento":
        return "category-badge-entertainment";
      case "mundo":
        return "category-badge-world";
      default:
        return "category-badge-default";
    }
  };

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const baseClasses = `category-badge ${getCategoryClass(category)} ${sizeClasses[size]}`;

  if (clickable) {
    return (
      <Link
        to={`/category/${category.toLowerCase()}`}
        className={`${baseClasses} hover:opacity-90 transition-opacity`}
      >
        {category}
      </Link>
    );
  }

  return <span className={baseClasses}>{category}</span>;
};

export default CategoryBadge;
