import { MessageCircle, Twitter, Link as LinkIcon, Check, Facebook, RefreshCw } from "lucide-react";
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
}

const ShareButtons = ({ title, url, slug }: ShareButtonsProps) => {
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

  const handleClearCache = () => {
    // Facebook Sharing Debugger is the most effective way to clear cache for FB and WhatsApp
    const debuggerUrl = `https://developers.facebook.com/tools/debug/sharing/?q=${encodeURIComponent(postUrl)}`;
    window.open(debuggerUrl, "_blank");
    toast.info("Abrindo Depurador do Facebook", {
      description: "Clique em 'Scrape Again' (Obter novas informações) na página que abrir.",
    });
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-news-muted font-medium mr-1">Compartilhar:</span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 h-9 w-9 p-0"
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
              variant="outline"
              size="sm"
              asChild
              className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 h-9 w-9 p-0"
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
              variant="outline"
              size="sm"
              asChild
              className="text-sky-500 border-sky-500 hover:bg-sky-50 hover:text-sky-600 h-9 w-9 p-0"
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
              className={`h-9 gap-2 transition-all duration-300 ${copied
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-news-muted hover:text-news-primary"
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
                  <span className="text-xs">Copiar Link</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copiar link para a área de transferência</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-news ml-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCache}
              className="text-news-muted hover:text-primary gap-1.5 h-9"
            >
              <RefreshCw size={14} className="animate-hover-spin" />
              <span className="text-[10px] uppercase tracking-wider font-bold">Limpar Cache</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Forçar atualização da imagem no WhatsApp/Facebook
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ShareButtons;
