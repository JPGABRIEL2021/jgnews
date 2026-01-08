import { useState } from "react";
import { Send, Mail, Users, TestTube, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const NewsletterAdmin = () => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Fetch subscriber count
  const { data: subscriberCount = 0 } = useQuery({
    queryKey: ["newsletter-subscriber-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch recent subscribers
  const { data: recentSubscribers = [] } = useQuery({
    queryKey: ["recent-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("email, name, subscribed_at")
        .eq("is_active", true)
        .order("subscribed_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const sendNewsletter = async (isTest: boolean) => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Preencha o assunto e o conteúdo da newsletter");
      return;
    }

    if (isTest && !testEmail.trim()) {
      toast.error("Informe um email para o teste");
      return;
    }

    if (isTest) {
      setIsTesting(true);
    } else {
      setIsSending(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar logado para enviar newsletters");
        return;
      }

      const response = await supabase.functions.invoke("send-newsletter", {
        body: {
          subject,
          content,
          testEmail: isTest ? testEmail : undefined
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(response.data.message);

      if (!isTest) {
        setSubject("");
        setContent("");
      }
    } catch (error: any) {
      console.error("Error sending newsletter:", error);
      toast.error(error.message || "Erro ao enviar newsletter");
    } finally {
      setIsSending(false);
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Gerenciar Newsletter</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inscritos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{subscriberCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compor Newsletter</TabsTrigger>
          <TabsTrigger value="subscribers">Inscritos Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova Newsletter</CardTitle>
              <CardDescription>
                Compose e envie uma newsletter para todos os inscritos ativos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Digite o assunto do email..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo (HTML)</Label>
                <Textarea
                  id="content"
                  placeholder="<h2>Título</h2><p>Seu conteúdo aqui...</p>"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Você pode usar HTML para formatar o conteúdo: &lt;h2&gt;, &lt;p&gt;, &lt;a href=""&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Email para teste..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    type="email"
                  />
                  <Button
                    variant="outline"
                    onClick={() => sendNewsletter(true)}
                    disabled={isTesting || isSending}
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline ml-2">Testar</span>
                  </Button>
                </div>
                <Button
                  onClick={() => sendNewsletter(false)}
                  disabled={isSending || isTesting}
                  className="gap-2"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Enviar para {subscriberCount} inscritos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Inscritos Recentes</CardTitle>
              <CardDescription>
                Últimos 10 inscritos na newsletter
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSubscribers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum inscrito ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {recentSubscribers.map((subscriber, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{subscriber.email}</p>
                        {subscriber.name && (
                          <p className="text-sm text-muted-foreground">{subscriber.name}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(subscriber.subscribed_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsletterAdmin;
