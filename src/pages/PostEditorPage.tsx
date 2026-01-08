import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
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
import { useCreatePost, useUpdatePost, usePost } from "@/hooks/usePosts";
import { categories, PostInsert } from "@/lib/posts";
import { toast } from "sonner";

const PostEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: existingPost, isLoading: loadingPost } = usePost(id || "");
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
  });

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
    if (!formData.cover_image.trim()) {
      toast.error("A imagem de capa é obrigatória");
      return;
    }

    try {
      if (isEditing && id) {
        await updatePost.mutateAsync({ id, updates: formData });
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
            <Label htmlFor="slug">URL (slug)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="url-da-noticia"
            />
            <p className="text-xs text-news-muted">
              URL: /post/{formData.slug || "url-da-noticia"}
            </p>
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
            <Label htmlFor="cover_image">URL da Imagem de Capa *</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {formData.cover_image && (
              <img
                src={formData.cover_image}
                alt="Preview"
                className="w-full max-w-md h-48 object-cover rounded-lg mt-2"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
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

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo (HTML) *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="<p>Escreva o conteúdo da notícia em HTML...</p>"
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-news-muted">
              Você pode usar tags HTML como &lt;p&gt;, &lt;h2&gt;, &lt;blockquote&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
            </p>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 py-4 border-t border-b border-news">
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
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isEditing ? "Salvar Alterações" : "Publicar Notícia"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin")}>
              Cancelar
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default PostEditorPage;
