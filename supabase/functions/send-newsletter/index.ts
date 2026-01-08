import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  subject: string;
  content: string;
  testEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Only admins can send newsletters");
    }

    const { subject, content, testEmail }: NewsletterRequest = await req.json();

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    let recipients: string[] = [];

    if (testEmail) {
      // Send test email to a single address
      recipients = [testEmail];
      console.log("Sending test email to:", testEmail);
    } else {
      // Get all active subscribers
      const { data: subscribers, error: subError } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("is_active", true);

      if (subError) {
        throw new Error("Failed to fetch subscribers: " + subError.message);
      }

      if (!subscribers || subscribers.length === 0) {
        throw new Error("No active subscribers found");
      }

      recipients = subscribers.map(s => s.email);
      console.log(`Sending newsletter to ${recipients.length} subscribers`);
    }

    // Build HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .footer a { color: #dc2626; }
            img { max-width: 100%; height: auto; }
            a { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JG News</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>Você está recebendo este email porque se inscreveu na nossa newsletter.</p>
            <p>© ${new Date().getFullYear()} JG News. Todos os direitos reservados.</p>
          </div>
        </body>
      </html>
    `;

    // Send emails in batches (Resend has rate limits)
    const batchSize = 50;
    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (email) => {
        try {
          const response = await resend.emails.send({
            from: "JG News <onboarding@resend.dev>",
            to: [email],
            subject: subject,
            html: htmlContent,
          });
          
          if (response.error) {
            throw new Error(response.error.message);
          }
          
          return { success: true, email };
        } catch (error: any) {
          console.error(`Failed to send to ${email}:`, error.message);
          return { success: false, email, error: error.message };
        }
      });

      const batchResults = await Promise.all(emailPromises);
      
      for (const result of batchResults) {
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${result.email}: ${result.error}`);
        }
      }

      // Small delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log("Newsletter send results:", results);

    return new Response(
      JSON.stringify({
        message: testEmail 
          ? "Email de teste enviado com sucesso!" 
          : `Newsletter enviada para ${results.success} inscritos`,
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes("Unauthorized") || error.message.includes("admin") ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
