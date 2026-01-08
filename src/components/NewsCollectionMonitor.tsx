import { useState, useMemo } from "react";
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
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  useCollectionConfig,
  useCollectionLogs,
  useAddConfig,
  useToggleConfig,
  useDeleteConfig,
  useTriggerCollection,
  useCollectionLogsRealtime,
  useUpdateTimeFilter,
  useUpdateScheduleInterval,
  CollectionLog,
  TIME_FILTER_OPTIONS,
  SCHEDULE_INTERVAL_OPTIONS,
  TimeFilterValue,
  ScheduleIntervalValue,
} from "@/hooks/useNewsCollection";
import { format, formatDistanceToNow, subDays, subWeeks, subMonths, startOfDay, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

type PeriodFilter = "today" | "week" | "month" | "all";

export default function NewsCollectionMonitor() {
  const [newSite, setNewSite] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("week");

  const { data: config, isLoading: configLoading } = useCollectionConfig();
  const { data: allLogs, isLoading: logsLoading, refetch: refetchLogs } = useCollectionLogs(100);
  const addConfig = useAddConfig();
  const toggleConfig = useToggleConfig();
  const deleteConfig = useDeleteConfig();
  const triggerCollection = useTriggerCollection();
  const updateTimeFilter = useUpdateTimeFilter();
  const updateScheduleInterval = useUpdateScheduleInterval();

  // Enable realtime updates and notifications
  useCollectionLogsRealtime();

  const sites = config?.filter((c) => c.type === "site") || [];
  const topics = config?.filter((c) => c.type === "topic") || [];
  const currentTimeFilter = config?.find((c) => c.type === "time_filter")?.value as TimeFilterValue | undefined;
  const currentScheduleInterval = config?.find((c) => c.type === "schedule_interval")?.value as ScheduleIntervalValue | undefined;

  // Filter logs by period
  const filteredLogs = useMemo(() => {
    if (!allLogs) return [];

    const now = new Date();
    let startDate: Date;

    switch (periodFilter) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "week":
        startDate = subWeeks(now, 1);
        break;
      case "month":
        startDate = subMonths(now, 1);
        break;
      case "all":
      default:
        return allLogs;
    }

    return allLogs.filter((log) => isAfter(new Date(log.started_at), startDate));
  }, [allLogs, periodFilter]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredLogs || filteredLogs.length === 0) return [];

    // Group logs by date
    const grouped = new Map<string, { date: string; collected: number; found: number; success: number; error: number }>();

    filteredLogs.forEach((log) => {
      const dateKey = format(new Date(log.started_at), "dd/MM", { locale: ptBR });
      const existing = grouped.get(dateKey) || { date: dateKey, collected: 0, found: 0, success: 0, error: 0 };

      existing.collected += log.articles_collected || 0;
      existing.found += log.articles_found || 0;
      if (log.status === "success") existing.success += 1;
      if (log.status === "error") existing.error += 1;

      grouped.set(dateKey, existing);
    });

    // Convert to array and reverse to show oldest first
    return Array.from(grouped.values()).reverse();
  }, [filteredLogs]);

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

  // Calculate stats from filtered logs
  const totalCollections = filteredLogs?.length || 0;
  const successfulCollections = filteredLogs?.filter((l) => l.status === "success").length || 0;
  const totalArticlesCollected = filteredLogs?.reduce((acc, l) => acc + (l.articles_collected || 0), 0) || 0;
  const lastCollection = filteredLogs?.[0];
  const successRate = totalCollections > 0 ? Math.round((successfulCollections / totalCollections) * 100) : 0;

  const getPeriodLabel = (period: PeriodFilter) => {
    switch (period) {
      case "today": return "Hoje";
      case "week": return "Última semana";
      case "month": return "Último mês";
      case "all": return "Todo período";
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Monitor de Coleta Automática
          </CardTitle>
          <div className="flex gap-2">
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{totalCollections}</div>
            <div className="text-xs text-muted-foreground">Coletas</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{successfulCollections}</div>
            <div className="text-xs text-muted-foreground">Bem-sucedidas</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalArticlesCollected}</div>
            <div className="text-xs text-muted-foreground">Artigos</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{successRate}%</div>
            <div className="text-xs text-muted-foreground">Taxa Sucesso</div>
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

        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="chart">
              <TrendingUp className="h-4 w-4 mr-1" />
              Gráfico
            </TabsTrigger>
            <TabsTrigger value="logs">Histórico</TabsTrigger>
            <TabsTrigger value="sites">Sites ({sites.length})</TabsTrigger>
            <TabsTrigger value="topics">Tópicos ({topics.length})</TabsTrigger>
            <TabsTrigger value="settings">
              <Clock className="h-4 w-4 mr-1" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-3">
            {logsLoading ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Nenhum dado para exibir no período selecionado
              </div>
            ) : (
              <div className="space-y-4">
                {/* Articles Collected Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Artigos Coletados por Dia</h4>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }} 
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }} 
                          className="text-muted-foreground"
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="collected"
                          name="Coletados"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorCollected)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Success/Error Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Execuções por Dia</h4>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }} 
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }} 
                          className="text-muted-foreground"
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar dataKey="success" name="Sucesso" fill="hsl(142, 76%, 36%)" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="error" name="Erro" fill="hsl(0, 84%, 60%)" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-3">
            <ScrollArea className="h-[300px]">
              {logsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLogs?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma coleta no período: {getPeriodLabel(periodFilter)}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs?.map((log) => (
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

          <TabsContent value="settings" className="mt-3">
            <div className="space-y-4">
              {/* Schedule Interval */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Agendamento Automático
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Define com que frequência a coleta automática será executada.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SCHEDULE_INTERVAL_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={(currentScheduleInterval || "1h") === option.value ? "default" : "outline"}
                      className="w-full"
                      onClick={() => updateScheduleInterval.mutate(option.value)}
                      disabled={updateScheduleInterval.isPending}
                    >
                      {updateScheduleInterval.isPending && (currentScheduleInterval || "1h") !== option.value ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : null}
                      A cada {option.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Configuração atual: <Badge variant="secondary">A cada {SCHEDULE_INTERVAL_OPTIONS.find(o => o.value === (currentScheduleInterval || "1h"))?.label}</Badge>
                </p>
              </div>

              {/* Time Filter */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Intervalo de Tempo para Coleta
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Define o período máximo de idade das notícias a serem coletadas.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {TIME_FILTER_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={(currentTimeFilter || "24h") === option.value ? "default" : "outline"}
                      className="w-full"
                      onClick={() => updateTimeFilter.mutate(option.value)}
                      disabled={updateTimeFilter.isPending}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Configuração atual: <Badge variant="secondary">{TIME_FILTER_OPTIONS.find(o => o.value === (currentTimeFilter || "24h"))?.label}</Badge>
                </p>
              </div>
            </div>
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
