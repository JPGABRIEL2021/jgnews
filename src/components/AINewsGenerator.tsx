import { useState, useRef } from "react";
import { Sparkles, Loader2, X, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/posts";
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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type GenerationStatus = "idle" | "generating" | "saving" | "done" | "error";

interface ParsedContent {
  title: string;
  subtitle: string;
  author: string;
  content: string;
}

const AINewsGenerator = () => {
  const queryClient = useQueryClient();
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
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const parseStreamedContent = (text: string): ParsedContent => {
    const titleMatch = text.match(/---TITULO---\s*([\s\S]*?)(?=---SUBTITULO---|$)/);
    const subtitleMatch = text.match(/---SUBTITULO---\s*([\s\S]*?)(?=---AUTOR---|$)/);
    const authorMatch = text.match(/---AUTOR---\s*([\s\S]*?)(?=---CONTEUDO---|$)/);
    const contentMatch = text.match(/---CONTEUDO---\s*([\s\S]*?)$/);

    return {
      title: titleMatch?.[1]?.trim() || "",
      subtitle: subtitleMatch?.[1]?.trim() || "",
      author: authorMatch?.[1]?.trim() || "",
      content: contentMatch?.[1]?.trim() || "",
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
    setParsedContent({ title: "", subtitle: "", author: "", content: "" });

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-news-stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setStatus("idle");
    setShowPreview(false);
  };

  const handleClose = () => {
    setShowPreview(false);
    setStatus("idle");
    setTopic("");
    setStreamedText("");
    setParsedContent({ title: "", subtitle: "", author: "", content: "" });
  };

  const isGenerating = status === "generating" || status === "saving";

  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-foreground">Gerador de Notícias com IA</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
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
      </div>

      <Dialog open={showPreview} onOpenChange={(open) => !isGenerating && setShowPreview(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} />
              {status === "done" ? "Notícia Gerada" : "Gerando Notícia..."}
              {isGenerating && <Loader2 size={16} className="animate-spin ml-2" />}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Título
              </label>
              <div className="p-3 bg-muted/50 rounded-md min-h-[40px]">
                {parsedContent.title ? (
                  <h2 className="text-xl font-bold text-foreground">{parsedContent.title}</h2>
                ) : (
                  <div className="h-6 bg-muted animate-pulse rounded" />
                )}
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Subtítulo
              </label>
              <div className="p-3 bg-muted/50 rounded-md min-h-[32px]">
                {parsedContent.subtitle ? (
                  <p className="text-muted-foreground">{parsedContent.subtitle}</p>
                ) : (
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                )}
              </div>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Autor
              </label>
              <div className="p-3 bg-muted/50 rounded-md min-h-[32px]">
                {parsedContent.author ? (
                  <p className="text-sm font-medium">{parsedContent.author}</p>
                ) : (
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Conteúdo
              </label>
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
                    <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/6" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            {isGenerating ? (
              <Button variant="destructive" onClick={handleCancel} className="gap-2">
                <X size={16} />
                Cancelar
              </Button>
            ) : (
              <Button onClick={handleClose} className="gap-2">
                <Check size={16} />
                Concluir
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AINewsGenerator;
