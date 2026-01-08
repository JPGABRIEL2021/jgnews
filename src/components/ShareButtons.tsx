import { MessageCircle, Twitter, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-news-muted font-medium">Compartilhar:</span>
      
      <Button
        variant="outline"
        size="sm"
        asChild
        className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
      >
        <a
          href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={16} />
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        asChild
        className="text-blue-500 border-blue-500 hover:bg-blue-50 hover:text-blue-600"
      >
        <a
          href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter size={16} />
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="text-news-muted hover:text-news-primary"
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      </Button>
    </div>
  );
};

export default ShareButtons;
