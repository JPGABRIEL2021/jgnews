import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "jgnews_cookie_consent";

type ConsentStatus = "pending" | "accepted" | "rejected";

interface CookieConsentProps {
  onConsent?: (accepted: boolean) => void;
}

export const CookieConsent = ({ onConsent }: CookieConsentProps) => {
  const [status, setStatus] = useState<ConsentStatus>("pending");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      setStatus(savedConsent as ConsentStatus);
      setIsVisible(false);
    } else {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setStatus("accepted");
    setIsVisible(false);
    onConsent?.(true);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setStatus("rejected");
    setIsVisible(false);
    onConsent?.(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || status !== "pending") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="container">
        <div className="bg-foreground text-background rounded-lg shadow-2xl p-6 md:flex md:items-center md:justify-between gap-6">
          {/* Icon and Text */}
          <div className="flex items-start gap-4 mb-4 md:mb-0">
            <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Cookies e Privacidade</h3>
              <p className="text-sm text-background/70">
                Utilizamos cookies para melhorar sua experiência de navegação, personalizar 
                conteúdo e analisar nosso tráfego. Ao clicar em "Aceitar", você concorda com 
                o uso de cookies conforme nossa{" "}
                <Link to="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleReject}
              className="border-background/20 text-background hover:bg-background/10"
            >
              Recusar
            </Button>
            <Button onClick={handleAccept} className="bg-primary hover:bg-primary/90">
              Aceitar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-background/60 hover:text-background hover:bg-background/10 md:hidden"
            >
              <X size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to check cookie consent status
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setConsent((savedConsent as ConsentStatus) || null);
  }, []);

  const hasAccepted = consent === "accepted";
  const hasRejected = consent === "rejected";
  const isPending = consent === null || consent === "pending";

  return { consent, hasAccepted, hasRejected, isPending };
};

export default CookieConsent;
