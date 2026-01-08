import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationsState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  vapidPublicKey: string | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationsState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: "default",
    vapidPublicKey: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const checkSupport = async () => {
      try {
        const supported = 
          typeof window !== "undefined" &&
          "serviceWorker" in navigator && 
          "PushManager" in window && 
          "Notification" in window;
        
        if (!mountedRef.current) return;

        if (!supported) {
          setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
          return;
        }

        const currentPermission = Notification.permission;
        
        // Fetch VAPID public key
        let publicKey: string | null = null;
        try {
          const { data, error } = await supabase.functions.invoke("get-vapid-key");
          if (!error && data?.publicKey) {
            publicKey = data.publicKey;
          }
        } catch (error) {
          console.error("Error fetching VAPID key:", error);
        }

        if (!mountedRef.current) return;
        
        // Check if already subscribed
        let subscribed = false;
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          subscribed = !!subscription;
        } catch (error) {
          console.error("Error checking subscription:", error);
        }

        if (!mountedRef.current) return;

        setState({
          isSupported: true,
          isSubscribed: subscribed,
          isLoading: false,
          permission: currentPermission,
          vapidPublicKey: publicKey,
        });
      } catch (error) {
        console.error("Error in checkSupport:", error);
        if (mountedRef.current) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    checkSupport();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const subscribe = useCallback(async () => {
    if (!state.isSupported) {
      toast.error("Push notifications não são suportadas neste navegador");
      return false;
    }

    if (!state.vapidPublicKey) {
      console.error("VAPID public key not available");
      toast.error("Configuração de notificações incompleta");
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const permissionResult = await Notification.requestPermission();
      
      if (!mountedRef.current) return false;
      
      setState(prev => ({ ...prev, permission: permissionResult }));

      if (permissionResult !== "granted") {
        toast.error("Permissão para notificações negada");
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(state.vapidPublicKey) as BufferSource,
      });

      const p256dhKey = subscription.getKey("p256dh");
      const authKey = subscription.getKey("auth");
      
      if (!p256dhKey || !authKey) {
        throw new Error("Failed to get subscription keys");
      }

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const authToken = btoa(String.fromCharCode(...new Uint8Array(authKey)));

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          endpoint: subscription.endpoint,
          p256dh,
          auth: authToken,
          user_id: user?.id || null,
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        console.error("Error saving subscription:", error);
        toast.error("Erro ao salvar inscrição");
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (mountedRef.current) {
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
      }
      toast.success("Notificações ativadas com sucesso!");
      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast.error("Erro ao ativar notificações");
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
      return false;
    }
  }, [state.isSupported, state.vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);

        await subscription.unsubscribe();
      }

      if (mountedRef.current) {
        setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      }
      toast.success("Notificações desativadas");
      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Erro ao desativar notificações");
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
      return false;
    }
  }, []);

  return {
    isSupported: state.isSupported,
    isSubscribed: state.isSubscribed,
    isLoading: state.isLoading,
    permission: state.permission,
    subscribe,
    unsubscribe,
  };
};
