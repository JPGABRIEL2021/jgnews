import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  category?: string; // Optional category filter
}

// Web Push implementation for Deno
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  // Simplified push - just POST to endpoint
  // For production, implement full VAPID authentication
  try {
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": "0",
        TTL: "86400",
      },
    });
    return response;
  } catch (error) {
    console.error("Push request failed:", error);
    throw error;
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

    console.log("Starting push notification send");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { title, body, url, icon, category }: PushNotificationRequest = await req.json();

    if (!title || !body) {
      console.error("Missing required fields: title and body");
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending push notification: ${title}${category ? ` for category: ${category}` : ""}`);

    // Get subscriptions - filter by category if provided
    let query = supabase.from("push_subscriptions").select("*");
    
    // If category is provided, filter subscriptions that include this category
    // We'll filter in code since array containment is complex
    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found");
      return new Response(
        JSON.stringify({ message: "No subscriptions to notify", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter by category if provided
    const filteredSubscriptions = category
      ? subscriptions.filter((sub) => {
          const categories = sub.categories as string[] | null;
          // If no categories set, include by default
          if (!categories || categories.length === 0) return true;
          // Check if category is in the subscription's preferred categories
          return categories.some((c) => 
            c.toLowerCase() === category.toLowerCase()
          );
        })
      : subscriptions;

    console.log(`Found ${subscriptions.length} total subscriptions, ${filteredSubscriptions.length} after category filter`);

    if (filteredSubscriptions.length === 0) {
      console.log("No subscriptions match the category filter");
      return new Response(
        JSON.stringify({ 
          message: "No subscriptions match the category", 
          sent: 0,
          totalSubscriptions: subscriptions.length,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      icon: icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
    });

    let successCount = 0;
    let failCount = 0;
    const expiredSubscriptions: string[] = [];

    // Send to filtered subscriptions
    for (const sub of filteredSubscriptions) {
      try {
        const response = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          vapidPublicKey,
          vapidPrivateKey
        );

        if (response.ok || response.status === 201) {
          successCount++;
          console.log(`Notification sent to subscription ${sub.id}`);
        } else if (response.status === 410 || response.status === 404) {
          console.log(`Subscription ${sub.id} expired`);
          expiredSubscriptions.push(sub.id);
          failCount++;
        } else {
          console.error(`Failed to send to ${sub.id}: ${response.status}`);
          failCount++;
        }
      } catch (pushError: unknown) {
        const errorMessage = pushError instanceof Error ? pushError.message : "Unknown error";
        console.error(`Failed to send to ${sub.id}:`, errorMessage);
        failCount++;
      }
    }

    // Clean up expired subscriptions
    if (expiredSubscriptions.length > 0) {
      console.log(`Removing ${expiredSubscriptions.length} expired subscriptions`);
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", expiredSubscriptions);
    }

    console.log(`Push notifications complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: "Push notifications sent",
        sent: successCount,
        failed: failCount,
        expired: expiredSubscriptions.length,
        totalSubscriptions: subscriptions.length,
        filteredSubscriptions: filteredSubscriptions.length,
        category: category || "all",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-push-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
