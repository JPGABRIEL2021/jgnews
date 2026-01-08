import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { categories } from "@/lib/posts";

interface NotificationPreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionEndpoint: string | null;
}

export const NotificationPreferences = ({
  open,
  onOpenChange,
  subscriptionEndpoint,
}: NotificationPreferencesProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && subscriptionEndpoint) {
      loadPreferences();
    }
  }, [open, subscriptionEndpoint]);

  const loadPreferences = async () => {
    if (!subscriptionEndpoint) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("categories")
        .eq("endpoint", subscriptionEndpoint)
        .single();

      if (error) throw error;

      if (data?.categories) {
        setSelectedCategories(data.categories);
      } else {
        // Default to all categories
        setSelectedCategories([...categories]);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      setSelectedCategories([...categories]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    setSelectedCategories([...categories]);
  };

  const handleDeselectAll = () => {
    setSelectedCategories([]);
  };

  const handleSave = async () => {
    if (!subscriptionEndpoint) return;

    if (selectedCategories.length === 0) {
      toast.error("Selecione pelo menos uma categoria");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("push_subscriptions")
        .update({ categories: selectedCategories })
        .eq("endpoint", subscriptionEndpoint);

      if (error) throw error;

      toast.success("Preferências salvas com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Erro ao salvar preferências");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferências de Notificação
          </DialogTitle>
          <DialogDescription>
            Escolha as categorias de notícias para as quais deseja receber alertas de última hora.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-6 text-center text-muted-foreground">
            Carregando preferências...
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {selectedCategories.length} de {categories.length} selecionadas
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Todas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Nenhuma
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleToggleCategory(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
