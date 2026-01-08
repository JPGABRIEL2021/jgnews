import { useState, useRef } from "react";
import { Sparkles, Loader2, X, Check, FileText, Search, Edit3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/posts";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type GenerationStatus = "idle" | "generating" | "saving" | "done" | "error";

interface ParsedContent {
  title: string;
  subtitle: string;
  author: string;
  content: string;
  isUrgent: boolean;
}

interface SearchResult {
  url: string;
  title: string;
  description: string;
  source: string;
  markdown: string;
}

interface RevisionChange {
  type: string;
  original: string;
  revised: string;
  reason: string;
}

const NEWS_SOURCES = [
  { value: "all", label: "Todos os Sites" },
  { value: "g1.globo.com", label: "G1" },
  { value: "folha.uol.com.br", label: "Folha de S.Paulo" },
  { value: "estadao.com.br", label: "Estadão" },
];

const AINewsGenerator = () => {
  const queryClient = useQueryClient();
  
  // Generate tab state
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("Geral");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [showPreview, setShowPreview] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [parsedContent, setParsedContent] = useState<ParsedContent>({
    title: "",
    subtitle: "",
    author: "",
    content: "",
    isUrgent: false,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSource, setSearchSource] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Revise tab state
  const [textToRevise, setTextToRevise] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  const [revisedText, setRevisedText] = useState("");
  const [revisionChanges, setRevisionChanges] = useState<RevisionChange[]>([]);
  const [revisionSummary, setRevisionSummary] = useState("");
  const [revisionIsUrgent, setRevisionIsUrgent] = useState(false);
  const [revisionUrgentReason, setRevisionUrgentReason] = useState("");
  const [revisionSeoImprovements, setRevisionSeoImprovements] = useState<string[]>([]);
  const [showRevision, setShowRevision] = useState(false);

  const parseStreamedContent = (text: string): ParsedContent => {
    const urgentMatch = text.match(/---URGENTE---\s*([\s\S]*?)(?=---TITULO---|$)/);
    const titleMatch = text.match(/---TITULO---\s*([\s\S]*?)(?=---SUBTITULO---|$)/);
    const subtitleMatch = text.match(/---SUBTITULO---\s*([\s\S]*?)(?=---AUTOR---|$)/);
    const authorMatch = text.match(/---AUTOR---\s*([\s\S]*?)(?=---CONTEUDO---|$)/);
    const contentMatch = text.match(/---CONTEUDO---\s*([\s\S]*?)$/);

    const urgentText = urgentMatch?.[1]?.trim().toUpperCase() || "";
    const isUrgent = urgentText === "SIM" || urgentText.includes("SIM");

    return {
      title: titleMatch?.[1]?.trim() || "",
      subtitle: subtitleMatch?.[1]?.trim() || "",
      author: authorMatch?.[1]?.trim() || "",
      content: contentMatch?.[1]?.trim() || "",
      isUrgent,
    };
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Digite um tópico para gerar a notícia");
      return;
    }

    setStatus("generating");
    setShowPreview(true);
    setStreamedText("");
    setParsedContent({ title: "", subtitle: "", author: "", content: "", isUrgent: false });

    abortControllerRef.current = new AbortController();

    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Você precisa estar logado para gerar notícias");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-news-stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ topic, category }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar notícia");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === "delta") {
              setStreamedText((prev) => {
                const newText = prev + data.content;
                setParsedContent(parseStreamedContent(newText));
                return newText;
              });
            } else if (data.type === "done") {
              setStatus("done");
              toast.success("Notícia gerada e salva com sucesso!");
              queryClient.invalidateQueries({ queryKey: ["posts"] });
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        toast.info("Geração cancelada");
      } else {
        console.error("Generation error:", error);
        toast.error((error as Error).message || "Erro ao gerar notícia");
        setStatus("error");
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Digite um termo para buscar");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("search-news", {
        body: { 
          query: searchQuery, 
          site: searchSource === "all" ? undefined : searchSource 
        },
      });

      if (error) {
        throw error;
      }

      setSearchResults(data.results || []);
      setShowSearchResults(true);
      
      if (data.results?.length === 0) {
        toast.info("Nenhuma notícia encontrada");
      } else {
        toast.success(`${data.results.length} notícias encontradas`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error((error as Error).message || "Erro ao buscar notícias");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRevise = async () => {
    if (!textToRevise.trim()) {
      toast.error("Digite ou cole o texto para revisar");
      return;
    }

    setIsRevising(true);
    setRevisedText("");
    setRevisionChanges([]);
    setRevisionSummary("");
    setRevisionIsUrgent(false);
    setRevisionUrgentReason("");
    setRevisionSeoImprovements([]);

    try {
      const { data, error } = await supabase.functions.invoke("revise-text", {
        body: { text: textToRevise },
      });

      if (error) {
        throw error;
      }

      setRevisedText(data.revisedText || "");
      setRevisionChanges(data.changes || []);
      setRevisionSummary(data.summary || "");
      setRevisionIsUrgent(data.isUrgent || false);
      setRevisionUrgentReason(data.urgentReason || "");
      setRevisionSeoImprovements(data.seoImprovements || []);
      setShowRevision(true);
      toast.success("Texto revisado com sucesso!");
    } catch (error) {
      console.error("Revision error:", error);
      toast.error((error as Error).message || "Erro ao revisar texto");
    } finally {
      setIsRevising(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setStatus("idle");
    setShowPreview(false);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setStatus("idle");
    setTopic("");
    setStreamedText("");
    setParsedContent({ title: "", subtitle: "", author: "", content: "", isUrgent: false });
  };

  const useSearchResultAsSource = (result: SearchResult) => {
    setTopic(`Baseado na notícia: "${result.title}"\n\nFonte: ${result.source}\n\n${result.description}`);
    setShowSearchResults(false);
    toast.success("Notícia selecionada como fonte. Clique em 'Gerar com IA' para criar sua versão.");
  };

  const copyRevisedText = () => {
    navigator.clipboard.writeText(revisedText);
    toast.success("Texto copiado para a área de transferência");
  };

  const isGenerating = status === "generating" || status === "saving";

  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-foreground">Assistente de Notícias com IA</h2>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles size={16} />
              Gerar
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search size={16} />
              Buscar
            </TabsTrigger>
            <TabsTrigger value="revise" className="gap-2">
              <Edit3 size={16} />
              Revisar
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Digite um tópico e veja a IA gerando a notícia em tempo real.
            </p>
            <div className="grid md:grid-cols-[1fr,200px,auto] gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tópico</label>
                <Textarea
                  placeholder="Ex: Preços do café no Brasil, Nova tecnologia de energia solar..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[80px] resize-none"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Categoria</label>
                <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !topic.trim()}
                className="gap-2 h-10"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Gerar com IA
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Busque notícias no G1, Folha e Estadão para usar como referência.
            </p>
            <div className="grid md:grid-cols-[1fr,200px,auto] gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Termo de Busca</label>
                <Input
                  placeholder="Ex: eleições 2026, economia brasileira, futebol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Fonte</label>
                <Select value={searchSource} onValueChange={setSearchSource} disabled={isSearching}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NEWS_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                className="gap-2 h-10"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Revise Tab */}
          <TabsContent value="revise" className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Cole um texto para revisão editorial: correção de português, remoção de sensacionalismo e ajuste de tom jornalístico.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Texto para Revisar</label>
                <Textarea
                  placeholder="Cole aqui o texto que deseja revisar..."
                  value={textToRevise}
                  onChange={(e) => setTextToRevise(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isRevising}
                />
              </div>
              <Button 
                onClick={handleRevise} 
                disabled={isRevising || !textToRevise.trim()}
                className="gap-2"
              >
                {isRevising ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Revisando...
                  </>
                ) : (
                  <>
                    <Edit3 size={18} />
                    Revisar como Editor-Chefe
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Generate Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={(open) => !isGenerating && setShowPreview(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} />
              {status === "done" ? "Notícia Gerada" : "Gerando Notícia..."}
              {isGenerating && <Loader2 size={16} className="animate-spin ml-2" />}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Urgency Badge */}
              {parsedContent.isUrgent && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded animate-pulse">
                    URGENTE
                  </span>
                  <span className="text-sm text-destructive font-medium">
                    Esta notícia foi classificada como urgente pela IA
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Título</label>
                <div className="p-3 bg-muted/50 rounded-md min-h-[40px]">
                  {parsedContent.title ? (
                    <h2 className="text-xl font-bold text-foreground">{parsedContent.title}</h2>
                  ) : (
                    <div className="h-6 bg-muted animate-pulse rounded" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subtítulo</label>
                <div className="p-3 bg-muted/50 rounded-md min-h-[32px]">
                  {parsedContent.subtitle ? (
                    <p className="text-muted-foreground">{parsedContent.subtitle}</p>
                  ) : (
                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Autor</label>
                <div className="p-3 bg-muted/50 rounded-md min-h-[32px]">
                  {parsedContent.author ? (
                    <p className="text-sm font-medium">{parsedContent.author}</p>
                  ) : (
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conteúdo</label>
                <div className="p-4 bg-muted/50 rounded-md min-h-[200px]">
                  {parsedContent.content ? (
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: parsedContent.content }}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                      <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t">
            {isGenerating ? (
              <Button variant="destructive" onClick={handleCancel} className="gap-2">
                <X size={16} />
                Cancelar
              </Button>
            ) : (
              <Button onClick={handleClosePreview} className="gap-2">
                <Check size={16} />
                Concluir
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Results Dialog */}
      <Dialog open={showSearchResults} onOpenChange={setShowSearchResults}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search size={20} />
              Resultados da Busca ({searchResults.length})
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[60vh] pr-4">
            <div className="space-y-4 pb-2">
              {searchResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{result.source}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                        {result.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(result.url, "_blank")}
                        className="gap-1"
                      >
                        <ExternalLink size={14} />
                        Abrir
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => useSearchResultAsSource(result)}
                        className="gap-1"
                      >
                        <Sparkles size={14} />
                        Usar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSearchResults(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog - Side by Side Comparison */}
      <Dialog open={showRevision} onOpenChange={setShowRevision}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 size={20} />
              Comparação de Revisão
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Urgency Alert */}
              {revisionIsUrgent && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded animate-pulse">
                      URGENTE
                    </span>
                    <span className="text-sm font-medium text-destructive">Notícia classificada como urgente</span>
                  </div>
                  {revisionUrgentReason && (
                    <p className="text-sm text-muted-foreground mt-1">{revisionUrgentReason}</p>
                  )}
                </div>
              )}

              {/* SEO Improvements */}
              {revisionSeoImprovements.length > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Melhorias de SEO Aplicadas</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {revisionSeoImprovements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {revisionSummary && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">Resumo das Alterações</p>
                  <p className="text-sm text-foreground mt-1">{revisionSummary}</p>
                </div>
              )}

              {/* Side by Side Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-destructive/20 border border-destructive"></span>
                    Texto Original
                  </label>
                  <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-md min-h-[200px]">
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {textToRevise.split(/\s+/).map((word, idx) => {
                        const isChanged = revisionChanges.some(
                          change => change.original.toLowerCase().includes(word.toLowerCase())
                        );
                        return (
                          <span
                            key={idx}
                            className={isChanged ? "bg-destructive/30 text-destructive-foreground px-0.5 rounded line-through decoration-destructive" : ""}
                          >
                            {word}{" "}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></span>
                    Texto Revisado
                  </label>
                  <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-md min-h-[200px]">
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {revisedText.split(/\s+/).map((word, idx) => {
                        const isNew = revisionChanges.some(
                          change => change.revised.toLowerCase().includes(word.toLowerCase()) &&
                                   !change.original.toLowerCase().includes(word.toLowerCase())
                        );
                        return (
                          <span
                            key={idx}
                            className={isNew ? "bg-green-500/30 text-green-900 dark:text-green-100 px-0.5 rounded font-medium" : ""}
                          >
                            {word}{" "}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {revisionChanges.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Alterações Detalhadas ({revisionChanges.length})
                  </label>
                  <div className="grid gap-2">
                    {revisionChanges.map((change, index) => (
                      <div key={index} className="p-3 border rounded-lg text-sm bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {change.type === "grammar" && "Gramática"}
                            {change.type === "clarity" && "Clareza"}
                            {change.type === "sensationalism" && "Sensacionalismo"}
                            {change.type === "style" && "Estilo"}
                            {change.type === "seo" && "SEO"}
                          </Badge>
                          {change.reason && (
                            <span className="text-xs text-muted-foreground">{change.reason}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 p-2 bg-destructive/10 rounded border-l-2 border-destructive">
                            <span className="line-through text-muted-foreground">{change.original}</span>
                          </div>
                          <span className="text-muted-foreground">→</span>
                          <div className="flex-1 p-2 bg-green-500/10 rounded border-l-2 border-green-500">
                            <span className="font-medium text-green-700 dark:text-green-400">{change.revised}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={copyRevisedText} className="gap-2">
              Copiar Texto Revisado
            </Button>
            <Button onClick={() => setShowRevision(false)} className="gap-2">
              <Check size={16} />
              Concluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AINewsGenerator;
