import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import DOMPurify from "dompurify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/RichTextEditor";
import SchedulePicker from "@/components/SchedulePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCreatePost, useUpdatePost, usePost } from "@/hooks/usePosts";
import { categories, PostInsert } from "@/lib/posts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PostEditorPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditing = !!slug;

  const { data: existingPost, isLoading: loadingPost } = usePost(slug || "");
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [formData, setFormData] = useState<PostInsert>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "Política",
    author: "",
    is_featured: false,
    is_breaking: false,
    scheduled_at: null,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Check if slug is unique
  const checkSlugUnique = async (slugToCheck: string): Promise<boolean> => {
    if (!slugToCheck.trim()) return true;
    
    setIsCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, slug")
        .eq("slug", slugToCheck)
        .maybeSingle();

      if (error) {
        console.error("Error checking slug:", error);
        return true;
      }

      // If editing, allow the current post's slug
      if (data && isEditing && existingPost && data.id === existingPost.id) {
        setSlugError(null);
        return true;
      }

      if (data) {
        setSlugError("Este slug já está em uso. Escolha outro.");
        return false;
      }

      setSlugError(null);
      return true;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Load existing post data when editing
  useEffect(() => {
    if (existingPost && isEditing) {
      setFormData({
        title: existingPost.title,
        slug: existingPost.slug,
        excerpt: existingPost.excerpt,
        content: existingPost.content,
        cover_image: existingPost.cover_image,
        category: existingPost.category,
        author: existingPost.author || "",
        is_featured: existingPost.is_featured,
        is_breaking: existingPost.is_breaking,
        scheduled_at: existingPost.scheduled_at,
      });
    }
  }, [existingPost, isEditing]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error("O resumo é obrigatório");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("O conteúdo é obrigatório");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("O slug é obrigatório");
      return;
    }

    // Check slug uniqueness before submitting
    const isSlugUnique = await checkSlugUnique(formData.slug);
    if (!isSlugUnique) {
      toast.error("Este slug já está em uso. Escolha outro.");
      return;
    }

    try {
      if (isEditing && existingPost) {
        await updatePost.mutateAsync({ id: existingPost.id, updates: formData });
      } else {
        await createPost.mutateAsync(formData);
      }
      navigate("/admin");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isSubmitting = createPost.isPending || updatePost.isPending;

  if (isEditing && loadingPost) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner text="Carregando notícia..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-news-muted hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Voltar para o painel
          </Link>
          <h1 className="text-3xl font-black text-news-primary">
            {isEditing ? "Editar Notícia" : "Nova Notícia"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Digite o título da notícia"
              className="text-lg"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL (slug) *</Label>
            <div className="relative">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  const newSlug = e.target.value
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/(^-|-$)/g, "");
                  setFormData(prev => ({ ...prev, slug: newSlug }));
                  setSlugError(null);
                }}
                onBlur={() => checkSlugUnique(formData.slug)}
                placeholder="url-da-noticia"
                className={slugError ? "border-destructive" : ""}
              />
              {isCheckingSlug && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {slugError ? (
              <p className="text-xs text-destructive">{slugError}</p>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                <span className="text-xs text-muted-foreground">Preview:</span>
                <code className="text-xs text-primary font-mono break-all">
                  jgnews.com.br/post/{formData.slug || "url-da-noticia"}
                </code>
              </div>
            )}
          </div>

          {/* Category and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Nome do autor"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Imagem de Capa *</Label>
            <ImageUpload
              value={formData.cover_image}
              onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo/Subtítulo *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Um breve resumo da notícia que aparece nas listagens"
              rows={2}
            />
          </div>

          {/* Content - Rich Text Editor */}
          <div className="space-y-2">
            <Label>Conteúdo *</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Escreva o conteúdo da notícia..."
            />
          </div>

          {/* Schedule */}
          <div className="py-4 border-t border-b border-border">
            <SchedulePicker
              value={formData.scheduled_at}
              onChange={(scheduled_at) => setFormData(prev => ({ ...prev, scheduled_at }))}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured" className="cursor-pointer">
                Marcar como Destaque
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_breaking"
                checked={formData.is_breaking}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_breaking: checked }))}
              />
              <Label htmlFor="is_breaking" className="cursor-pointer">
                Marcar como Urgente (Breaking News)
              </Label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="gap-2"
            >
              <Eye size={18} />
              Visualizar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {formData.scheduled_at 
                ? "Agendar Publicação" 
                : isEditing 
                  ? "Salvar Alterações" 
                  : "Publicar Notícia"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin")}>
              Cancelar
            </Button>
          </div>
        </form>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye size={20} />
                Pré-visualização da Notícia
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 max-h-[70vh] pr-4">
              <article className="space-y-6">
                {/* Cover Image */}
                {formData.cover_image ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={formData.cover_image}
                      alt={`Imagem: ${formData.title || "Notícia"}`}
                      className="w-full h-full object-cover"
                    />
                    {formData.is_breaking && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="destructive" className="animate-pulse font-bold">
                          URGENTE
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Sem imagem de capa</span>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary">{formData.category}</Badge>
                  {formData.is_featured && (
                    <Badge variant="outline" className="border-primary text-primary">
                      Destaque
                    </Badge>
                  )}
                  {formData.author && (
                    <span className="text-sm text-muted-foreground">
                      Por {formData.author}
                    </span>
                  )}
                  {formData.scheduled_at && (
                    <span className="text-sm text-muted-foreground">
                      Agendado para: {new Date(formData.scheduled_at).toLocaleString("pt-BR")}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                  {formData.title || "Título da notícia"}
                </h1>

                {/* Excerpt */}
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {formData.excerpt || "Resumo da notícia..."}
                </p>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(formData.content || "<p>Conteúdo da notícia...</p>", {
                      ALLOWED_TAGS: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'br', 'span', 'img'],
                      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt']
                    })
                  }}
                />
              </article>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                URL: /post/{formData.slug || "url-da-noticia"}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Continuar Editando
                </Button>
                <Button 
                  onClick={(e) => {
                    setShowPreview(false);
                    handleSubmit(e as unknown as React.FormEvent);
                  }}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {formData.scheduled_at ? "Agendar" : isEditing ? "Salvar" : "Publicar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default PostEditorPage;
