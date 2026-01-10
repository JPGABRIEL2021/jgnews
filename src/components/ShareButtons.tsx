import { MessageCircle, Twitter, Link as LinkIcon, Check, Facebook, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareButtonsProps {
  title: string;
  url: string;
  slug?: string;
  variant?: "default" | "prominent" | "floating";
}

const ShareButtons = ({ title, url, slug, variant = "default" }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  // Use the actual site URL for sharing to keep it professional and user-friendly.
  const siteUrl = "https://jgnews.com.br";
  const postUrl = slug ? `${siteUrl}/post/${slug}` : url;

  const shareUrl = encodeURIComponent(postUrl);
  const shareTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Link copiado com sucesso!", {
        description: "Agora você pode colar em qualquer lugar.",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  // Native share for mobile
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: postUrl,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && navigator.share;

  if (variant === "floating") {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 md:hidden">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg"
          asChild
        >
          <a
            href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartilhar no WhatsApp"
          >
            <MessageCircle size={22} />
          </a>
        </Button>
        {hasNativeShare && (
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            onClick={handleNativeShare}
            aria-label="Compartilhar"
          >
            <Share2 size={22} />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "prominent") {
    return (
      <div className="bg-muted/50 rounded-xl p-4 border border-border">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Share2 size={16} className="text-primary" />
          Compartilhe esta notícia
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1 min-w-[120px] bg-[#25D366] hover:bg-[#128C7E] text-white font-medium gap-2"
            asChild
          >
            <a
              href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </Button>

          <Button
            className="flex-1 min-w-[120px] bg-[#1877F2] hover:bg-[#0d65d9] text-white font-medium gap-2"
            asChild
          >
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={18} />
              Facebook
            </a>
          </Button>

          <Button
            className="flex-1 min-w-[120px] bg-[#1DA1F2] hover:bg-[#0c85d0] text-white font-medium gap-2"
            asChild
          >
            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter size={18} />
              X / Twitter
            </a>
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            className={`flex-1 min-w-[120px] gap-2 font-medium transition-all duration-300 ${
              copied
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            }`}
          >
            {copied ? (
              <>
                <Check size={18} />
                Copiado!
              </>
            ) : (
              <>
                <LinkIcon size={18} />
                Copiar Link
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Default variant with improved visibility
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-foreground font-semibold mr-1 flex items-center gap-1.5">
          <Share2 size={14} className="text-primary" />
          Compartilhar:
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              asChild
              className="bg-[#25D366] hover:bg-[#128C7E] text-white h-9 w-9 p-0 shadow-sm"
            >
              <a
                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Compartilhar no WhatsApp</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              asChild
              className="bg-[#1877F2] hover:bg-[#0d65d9] text-white h-9 w-9 p-0 shadow-sm"
            >
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={18} />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Compartilhar no Facebook</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              asChild
              className="bg-[#1DA1F2] hover:bg-[#0c85d0] text-white h-9 w-9 p-0 shadow-sm"
            >
              <a
                href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={18} />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Compartilhar no X (Twitter)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className={`h-9 gap-2 transition-all duration-300 shadow-sm ${copied
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
                }`}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span className="text-xs font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={16} />
                  <span className="text-xs font-medium">Copiar Link</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copiar link para a área de transferência</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ShareButtons;
