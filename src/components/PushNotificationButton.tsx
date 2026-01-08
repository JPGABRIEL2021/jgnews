import { useState } from "react";
import { Bell, BellOff, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { NotificationPreferences } from "./NotificationPreferences";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const PushNotificationButton = () => {
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    permission, 
    subscriptionEndpoint,
    subscribe, 
    unsubscribe 
  } = usePushNotifications();
  
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  if (!isSupported) {
    return null;
  }

  const handleSubscribe = async () => {
    await subscribe();
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (!isSubscribed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSubscribe}
            disabled={permission === "denied"}
          >
            <BellOff className="h-5 w-5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {permission === "denied"
              ? "Notificações bloqueadas pelo navegador"
              : "Ativar notificações de última hora"}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-primary" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notificações ativadas</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setPreferencesOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Preferências
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleUnsubscribe}
            className="text-destructive focus:text-destructive"
          >
            <BellOff className="h-4 w-4 mr-2" />
            Desativar notificações
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationPreferences
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        subscriptionEndpoint={subscriptionEndpoint}
      />
    </>
  );
};
