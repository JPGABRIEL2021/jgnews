import { X, Download, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";

export const PWAInstallBanner = () => {
  const { canInstall, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user dismissed the banner before
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    // Delay showing the banner
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setIsDismissed(true);
    }
  };

  if (!canInstall || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-lg shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Instalar JG News
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Instale o app para acesso rápido e notícias offline
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstall}
                className="gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs text-muted-foreground"
              >
                Agora não
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-muted rounded-md transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};
