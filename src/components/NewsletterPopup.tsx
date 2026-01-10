import { useState, useEffect } from "react";
import { X, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const POPUP_STORAGE_KEY = "jgnews-newsletter-popup-dismissed";
const POPUP_DELAY_MS = 30000; // 30 seconds
const SCROLL_THRESHOLD = 0.4; // 40% of page

const NewsletterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Check if user has dismissed popup before
    const dismissed = localStorage.getItem(POPUP_STORAGE_KEY);
    if (dismissed) return;

    let timeoutId: NodeJS.Timeout;
    let scrollTriggered = false;

    // Time-based trigger
    timeoutId = setTimeout(() => {
      if (!hasTriggered) {
        setIsVisible(true);
        setHasTriggered(true);
      }
    }, POPUP_DELAY_MS);

    // Scroll-based trigger
    const handleScroll = () => {
      if (scrollTriggered || hasTriggered) return;
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = window.scrollY / scrollHeight;
      
      if (scrollProgress >= SCROLL_THRESHOLD) {
        scrollTriggered = true;
        setIsVisible(true);
        setHasTriggered(true);
        clearTimeout(timeoutId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasTriggered]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(POPUP_STORAGE_KEY, "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Digite seu e-mail");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === "23505") {
          toast.info("Este e-mail já está cadastrado!");
        } else {
          throw error;
        }
      } else {
        toast.success("Inscrição realizada com sucesso! 🎉");
        setEmail("");
        handleClose();
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Erro ao realizar inscrição. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="relative bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary" />
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>

          {/* Content */}
          <div className="p-6 pt-8 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Fique por dentro
              </span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 font-serif">
              Receba as principais notícias
            </h3>

            <p className="text-sm text-muted-foreground mb-6">
              Assine nossa newsletter e receba as notícias mais importantes diretamente no seu e-mail. É grátis!
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-center text-base bg-muted/50 border-border focus:border-primary"
                required
              />
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Inscrevendo..." : "Quero receber notícias"}
              </Button>
            </form>

            {/* Privacy note */}
            <p className="text-xs text-muted-foreground mt-4">
              Ao se inscrever, você concorda com nossa{" "}
              <a href="/privacidade" className="underline hover:text-primary">
                política de privacidade
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsletterPopup;
