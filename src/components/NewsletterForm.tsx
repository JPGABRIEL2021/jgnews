import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "E-mail é obrigatório" })
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail muito longo" }),
  name: z
    .string()
    .trim()
    .max(100, { message: "Nome muito longo" })
    .optional(),
});

interface NewsletterFormProps {
  variant?: "default" | "compact" | "footer";
  className?: string;
}

export const NewsletterForm = ({ variant = "default", className = "" }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = emailSchema.safeParse({ email, name: name || undefined });
    if (!validation.success) {
      const errors = validation.error.errors;
      toast.error(errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: validation.data.email,
          name: validation.data.name || null,
        });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - email already exists
          toast.info("Este e-mail já está inscrito na newsletter!");
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast.success("Inscrição realizada com sucesso!");
        setEmail("");
        setName("");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Erro ao realizar inscrição. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-primary/10 rounded-lg ${className}`}>
        <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
        <div>
          <p className="font-medium text-news-primary">Obrigado por se inscrever!</p>
          <p className="text-sm text-news-muted">
            Você receberá nossas melhores notícias no seu e-mail.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={className}>
        <h4 className="font-bold text-background mb-3">Newsletter</h4>
        <p className="text-sm text-background/60 mb-4">
          Receba as principais notícias no seu e-mail.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background/10 border-background/20 text-background placeholder:text-background/40"
            disabled={isLoading}
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Inscrever-se"
            )}
          </Button>
        </form>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail size={18} />}
        </Button>
      </form>
    );
  }

  // Default variant
  return (
    <div className={`bg-news-subtle border border-news rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div>
          <span className="font-bold text-news-primary block">Newsletter JG News</span>
          <p className="text-sm text-news-muted">Receba as principais notícias no seu e-mail</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Seu nome (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <Input
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Inscrevendo...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Inscrever-se gratuitamente
            </>
          )}
        </Button>
        <p className="text-xs text-news-muted text-center">
          Ao se inscrever, você concorda com nossa{" "}
          <a href="/privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </form>
    </div>
  );
};

export default NewsletterForm;
