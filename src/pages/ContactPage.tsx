import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MapPin } from "lucide-react";

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    (e.target as HTMLFormElement).reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Fale Conosco" 
        description="Entre em contato com a redação do JG News. Envie sugestões de pauta, denúncias, dúvidas ou reclamações."
        keywords="contato JG News, fale conosco, redação, sugestão de pauta, denúncia"
      />
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-news-primary mb-6">
            Fale Conosco
          </h1>
          
          <p className="text-lg text-news-secondary mb-8">
            Sua opinião é importante para nós. Entre em contato com nossa redação para enviar 
            sugestões de pauta, denúncias, dúvidas ou reclamações.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-news-primary">E-mail</h3>
                  <a href="mailto:jptenorio.alves@gmail.com" className="text-news-secondary hover:text-primary">
                    jptenorio.alves@gmail.com
                  </a>
                </div>
              </div>
              
              {/* Phone section removed - no phone contact available */}
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-news-primary">Endereço</h3>
                  <p className="text-news-secondary">
                    São Paulo, SP<br />
                    Brasil
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      required 
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    required 
                    placeholder="Qual o assunto?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    required 
                    rows={6}
                    placeholder="Escreva sua mensagem..."
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
