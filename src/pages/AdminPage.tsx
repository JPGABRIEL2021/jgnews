import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  AlertTriangle,
  ArrowLeft,
  Search,
  MoreHorizontal,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import AINewsGenerator from "@/components/AINewsGenerator";
import NewsCollectionMonitor from "@/components/NewsCollectionMonitor";
import NewsletterAdmin from "@/components/NewsletterAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  usePosts,
  useDeletePost,
  useToggleFeatured,
  useToggleBreaking,
  usePostsRealtime
} from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Post } from "@/lib/posts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const AdminPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const { user, signOut } = useAuth();

  // Enable realtime updates
  usePostsRealtime();

  const { data: posts = [], isLoading } = usePosts();
  const deletePost = useDeletePost();
  const toggleFeatured = useToggleFeatured();
  const toggleBreaking = useToggleBreaking();

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePost.mutate(postToDelete.id);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handleToggleFeatured = (post: Post) => {
    toggleFeatured.mutate({ id: post.id, isFeatured: !post.is_featured });
  };

  const handleToggleBreaking = (post: Post) => {
    toggleBreaking.mutate({
      id: post.id,
      isBreaking: !post.is_breaking,
      postTitle: post.title,
      postSlug: post.slug,
      postCategory: post.category,
    });
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Erro ao sair");
      return;
    }
    toast.success("Você saiu do sistema");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-news-muted hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              Voltar para o site
            </Link>
            <h1 className="text-3xl font-black text-news-primary">
              Painel Administrativo
            </h1>
            <p className="text-news-muted mt-1">
              Gerencie as notícias do portal
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-news-muted hidden sm:inline">
              {user?.email}
            </span>
            <Link to="/admin/new">
              <Button className="gap-2">
                <Plus size={18} />
                <span className="hidden sm:inline">Nova Notícia</span>
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={toggleTheme} title={isDarkMode ? "Modo Claro" : "Modo Escuro"}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout} title="Sair">
              <LogOut size={18} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-news-muted" size={18} />
          <Input
            type="search"
            placeholder="Buscar notícias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* AI News Generator with Streaming */}
        <AINewsGenerator />

        {/* News Collection Monitor */}
        <div className="mb-8">
          <NewsCollectionMonitor />
        </div>

        {/* Newsletter Admin */}
        <div className="mb-8">
          <NewsletterAdmin />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-sm text-news-muted">Total</p>
            <p className="text-2xl font-bold text-news-primary">{posts.length}</p>
          </div>
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-sm text-news-muted">Destaques</p>
            <p className="text-2xl font-bold text-yellow-600">
              {posts.filter(p => p.is_featured).length}
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-sm text-news-muted">Urgentes</p>
            <p className="text-2xl font-bold text-primary">
              {posts.filter(p => p.is_breaking).length}
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-sm text-news-muted">Categorias</p>
            <p className="text-2xl font-bold text-news-primary">
              {new Set(posts.map(p => p.category)).size}
            </p>
          </div>
        </div>

        {/* Posts Table */}
        {isLoading ? (
          <LoadingSpinner text="Carregando notícias..." />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-secondary rounded-lg">
            <p className="text-news-muted">Nenhuma notícia encontrada</p>
          </div>
        ) : (
          <div className="border border-news rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <img
                          src={post.cover_image}
                          alt=""
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-news-primary line-clamp-2">
                            {post.title}
                          </p>
                          <p className="text-xs text-news-muted mt-1">
                            {post.author || "Sem autor"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{post.category}</Badge>
                    </TableCell>
                    <TableCell className="text-news-muted text-sm">
                      {format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {post.is_featured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Star size={12} className="mr-1" />
                            Destaque
                          </Badge>
                        )}
                        {post.is_breaking && (
                          <Badge variant="destructive">
                            <AlertTriangle size={12} className="mr-1" />
                            Urgente
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/edit/${post.slug}`} className="flex items-center gap-2">
                              <Pencil size={14} />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/post/${post.slug}`} className="flex items-center gap-2" target="_blank">
                              Ver no site
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleFeatured(post)}>
                            <Star size={14} className="mr-2" />
                            {post.is_featured ? "Remover destaque" : "Marcar como destaque"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleBreaking(post)}>
                            <AlertTriangle size={14} className="mr-2" />
                            {post.is_breaking ? "Remover urgente" : "Marcar como urgente"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(post)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir notícia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A notícia "{postToDelete?.title}" será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
