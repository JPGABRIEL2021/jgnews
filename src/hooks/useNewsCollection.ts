import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

// Types for the collection system
export interface CollectionConfig {
  id: string;
  type: "site" | "topic" | "time_filter" | "schedule_interval";
  value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TimeFilterValue = "1h" | "6h" | "12h" | "24h";

export const TIME_FILTER_OPTIONS: { value: TimeFilterValue; label: string }[] = [
  { value: "1h", label: "Última 1 hora" },
  { value: "6h", label: "Últimas 6 horas" },
  { value: "12h", label: "Últimas 12 horas" },
  { value: "24h", label: "Últimas 24 horas" },
];

export type ScheduleIntervalValue = "30m" | "1h" | "2h" | "6h";

export const SCHEDULE_INTERVAL_OPTIONS: { value: ScheduleIntervalValue; label: string; cron: string }[] = [
  { value: "30m", label: "30 minutos", cron: "*/30 * * * *" },
  { value: "1h", label: "1 hora", cron: "0 * * * *" },
  { value: "2h", label: "2 horas", cron: "0 */2 * * *" },
  { value: "6h", label: "6 horas", cron: "0 */6 * * *" },
];

export interface CollectionLog {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: "running" | "success" | "error";
  search_query: string | null;
  articles_found: number;
  articles_collected: number;
  error_message: string | null;
  duration_seconds: number | null;
  created_posts: Array<{
    id: string;
    title: string;
    category: string;
    is_breaking: boolean;
  }>;
}

// Fetch collection config (sites and topics)
export function useCollectionConfig() {
  return useQuery({
    queryKey: ["collection-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_collection_config")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CollectionConfig[];
    },
  });
}

// Fetch collection logs
export function useCollectionLogs(limit = 20) {
  return useQuery({
    queryKey: ["collection-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_collection_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as CollectionLog[];
    },
  });
}

// Add new config item
export function useAddConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, value }: { type: "site" | "topic" | "time_filter"; value: string }) => {
      const { data, error } = await supabase
        .from("news_collection_config")
        .insert({ type, value })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-config"] });
      toast.success("Item adicionado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar: ${error.message}`);
    },
  });
}

// Update time filter config
export function useUpdateTimeFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: TimeFilterValue) => {
      // First check if a time_filter config exists
      const { data: existing } = await supabase
        .from("news_collection_config")
        .select("id")
        .eq("type", "time_filter")
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("news_collection_config")
          .update({ value, is_active: true })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("news_collection_config")
          .insert({ type: "time_filter", value, is_active: true });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-config"] });
      toast.success("Intervalo de tempo atualizado");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

// Update schedule interval config and cron job
export function useUpdateScheduleInterval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: ScheduleIntervalValue) => {
      // First, update the config in the database
      const { data: existing } = await supabase
        .from("news_collection_config")
        .select("id")
        .eq("type", "schedule_interval")
        .single();

      if (existing) {
        const { error } = await supabase
          .from("news_collection_config")
          .update({ value, is_active: true })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("news_collection_config")
          .insert({ type: "schedule_interval", value, is_active: true });
        if (error) throw error;
      }

      // Then, update the cron job via edge function
      const { error: cronError } = await supabase.functions.invoke("update-cron-schedule", {
        body: { interval: value }
      });
      if (cronError) throw cronError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-config"] });
      toast.success("Agendamento atualizado");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

// Toggle config item active status
export function useToggleConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("news_collection_config")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-config"] });
    },
  });
}

// Delete config item
export function useDeleteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("news_collection_config")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-config"] });
      toast.success("Item removido");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });
}

// Trigger manual collection
export function useTriggerCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("auto-collect-news", {
        body: { manual: true }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collection-logs"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(data?.message || "Coleta concluída");
    },
    onError: (error: Error) => {
      toast.error(`Erro na coleta: ${error.message}`);
    },
  });
}

// Real-time subscription for collection logs
export function useCollectionLogsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("collection-logs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news_collection_logs",
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["collection-logs"] });

          // Show notification for completed collections
          if (payload.eventType === "UPDATE") {
            const log = payload.new as CollectionLog;
            if (log.status === "success" && log.articles_collected > 0) {
              toast.success(
                `🤖 Coleta automática: ${log.articles_collected} notícia${log.articles_collected > 1 ? "s" : ""} coletada${log.articles_collected > 1 ? "s" : ""}`,
                {
                  description: "Clique para ver as novas notícias",
                  duration: 8000,
                }
              );
              // Also invalidate posts
              queryClient.invalidateQueries({ queryKey: ["posts"] });
            } else if (log.status === "error") {
              toast.error("Erro na coleta automática", {
                description: log.error_message || "Verifique os logs",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
