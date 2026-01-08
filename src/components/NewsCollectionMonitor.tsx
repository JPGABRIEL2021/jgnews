import { useState } from "react";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Tag,
  Plus,
  Trash2,
  Play,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCollectionConfig,
  useCollectionLogs,
  useAddConfig,
  useToggleConfig,
  useDeleteConfig,
  useTriggerCollection,
  useCollectionLogsRealtime,
  CollectionLog,
} from "@/hooks/useNewsCollection";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NewsCollectionMonitor() {
  const [newSite, setNewSite] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const { data: config, isLoading: configLoading } = useCollectionConfig();
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useCollectionLogs();
  const addConfig = useAddConfig();
  const toggleConfig = useToggleConfig();
  const deleteConfig = useDeleteConfig();
  const triggerCollection = useTriggerCollection();

  // Enable realtime updates and notifications
  useCollectionLogsRealtime();

  const sites = config?.filter((c) => c.type === "site") || [];
  const topics = config?.filter((c) => c.type === "topic") || [];

  const handleAddSite = () => {
    if (!newSite.trim()) return;
    addConfig.mutate({ type: "site", value: newSite.trim() });
    setNewSite("");
  };

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    addConfig.mutate({ type: "topic", value: newTopic.trim() });
    setNewTopic("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Em execução</Badge>;
      case "success":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Sucesso</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  // Calculate stats
  const totalCollections = logs?.length || 0;
  const successfulCollections = logs?.filter((l) => l.status === "success").length || 0;
  const totalArticlesCollected = logs?.reduce((acc, l) => acc + (l.articles_collected || 0), 0) || 0;
  const lastCollection = logs?.[0];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Monitor de Coleta Automática
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchLogs()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => triggerCollection.mutate()}
              disabled={triggerCollection.isPending}
            >
              {triggerCollection.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Executar Agora
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{totalCollections}</div>
            <div className="text-xs text-muted-foreground">Coletas Totais</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{successfulCollections}</div>
            <div className="text-xs text-muted-foreground">Bem-sucedidas</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalArticlesCollected}</div>
            <div className="text-xs text-muted-foreground">Artigos Coletados</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-sm font-medium text-muted-foreground">
              {lastCollection
                ? formatDistanceToNow(new Date(lastCollection.started_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })
                : "—"}
            </div>
            <div className="text-xs text-muted-foreground">Última Coleta</div>
          </div>
        </div>

        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Histórico</TabsTrigger>
            <TabsTrigger value="sites">Sites ({sites.length})</TabsTrigger>
            <TabsTrigger value="topics">Tópicos ({topics.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-3">
            <ScrollArea className="h-[300px]">
              {logsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : logs?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma coleta registrada ainda
                </div>
              ) : (
                <div className="space-y-2">
                  {logs?.map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sites" className="mt-3">
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ex: uol.com.br"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSite()}
              />
              <Button onClick={handleAddSite} disabled={addConfig.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[250px]">
              {configLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sites.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum site configurado
                </div>
              ) : (
                <div className="space-y-2">
                  {sites.map((site) => (
                    <div
                      key={site.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className={!site.is_active ? "text-muted-foreground line-through" : ""}>
                          {site.value}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={site.is_active}
                          onCheckedChange={(checked) =>
                            toggleConfig.mutate({ id: site.id, is_active: checked })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteConfig.mutate(site.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="topics" className="mt-3">
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ex: clima no Brasil"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
              />
              <Button onClick={handleAddTopic} disabled={addConfig.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[250px]">
              {configLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum tópico configurado
                </div>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className={!topic.is_active ? "text-muted-foreground line-through" : ""}>
                          {topic.value}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={topic.is_active}
                          onCheckedChange={(checked) =>
                            toggleConfig.mutate({ id: topic.id, is_active: checked })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteConfig.mutate(topic.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LogItem({ log }: { log: CollectionLog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {log.status === "running" ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : log.status === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {format(new Date(log.started_at), "dd/MM HH:mm", { locale: ptBR })}
          </span>
          {log.status === "success" ? (
            <Badge variant="outline" className="text-xs">
              {log.articles_collected}/{log.articles_found} artigos
            </Badge>
          ) : log.status === "running" ? (
            <Badge variant="outline" className="text-xs bg-blue-500/10">
              Em execução...
            </Badge>
          ) : null}
        </div>
        {log.duration_seconds && (
          <span className="text-xs text-muted-foreground">
            {log.duration_seconds}s
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-border/50 text-sm">
          {log.search_query && (
            <p className="text-muted-foreground text-xs mb-1">
              <strong>Busca:</strong> {log.search_query}
            </p>
          )}
          {log.error_message && (
            <p className="text-red-500 text-xs">
              <strong>Erro:</strong> {log.error_message}
            </p>
          )}
          {log.created_posts && log.created_posts.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">Artigos criados:</p>
              <div className="space-y-1">
                {log.created_posts.map((post) => (
                  <div key={post.id} className="flex items-center gap-1 text-xs">
                    {post.is_breaking && (
                      <Badge variant="destructive" className="text-[10px] px-1 py-0">
                        URGENTE
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      {post.category}
                    </Badge>
                    <span className="truncate">{post.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
