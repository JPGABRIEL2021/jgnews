import { MessageCircle, Twitter, Link as LinkIcon, Check, Facebook } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
  slug?: string;
}

const ShareButtons = ({ title, url, slug }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  // Use the actual site URL for sharing to keep it professional and user-friendly.
  // Note: To have the dynamic image preview work with this URL, the domain hosting 
  // (e.g. Netlify/Vercel) must be configured to proxy crawlers to the og-image function.
  const siteUrl = "https://jgnews.com.br";
  const postUrl = slug ? `${siteUrl}/post/${slug}` : url;

  const shareUrl = encodeURIComponent(postUrl);
  const shareTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      // Copy the sharing URL to preserved preview.
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Link de compartilhamento copiado!");
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
        className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
      >
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Facebook size={16} />
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        asChild
        className="text-sky-500 border-sky-500 hover:bg-sky-50 hover:text-sky-600"
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
