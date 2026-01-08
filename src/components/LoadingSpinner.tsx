import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner = ({ text = "Carregando..." }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-news-muted">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
