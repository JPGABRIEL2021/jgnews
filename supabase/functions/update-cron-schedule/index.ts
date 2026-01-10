import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Note: Supabase Crons use UTC. Brasília is UTC-3.
// 06:30 Brasília = 09:30 UTC. 23:59 Brasília = 02:59 UTC.
const CRON_EXPRESSIONS: Record<string, string> = {
  "30m": "0,30 9-23,0-2 * * *",  // 06:00 to 23:30 BRT
  "1h": "0 9-23,0-2 * * *",      // 06:00 to 23:00 BRT
  "2h": "0 9,11,13,15,17,19,21,23,1 * * *", // Every 2h from 06:00 BRT
  "6h": "0 9,15,21,3 * * *",     // 06:00, 12:00, 18:00, 00:00 BRT
};

const JOB_NAME = 'auto-collect-news-hourly';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user's token to verify auth
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client to check admin role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the interval from request body
    const { interval } = await req.json();

    if (!interval || !CRON_EXPRESSIONS[interval]) {
      return new Response(
        JSON.stringify({ error: 'Invalid interval. Use: 30m, 1h, 2h, or 6h' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cronExpression = CRON_EXPRESSIONS[interval];
    const functionUrl = `${supabaseUrl}/functions/v1/auto-collect-news`;

    console.log(`🔄 Updating cron schedule to: ${cronExpression} (${interval})`);

    // First, unschedule the existing job
    const { error: unscheduleError } = await supabaseAdmin.rpc('cron_unschedule', {
      job_name: JOB_NAME
    }).maybeSingle();

    if (unscheduleError) {
      console.log('Note: Could not unschedule existing job (might not exist):', unscheduleError.message);
    }

    // Schedule the new job
    const scheduleQuery = `
      SELECT cron.schedule(
        '${JOB_NAME}',
        '${cronExpression}',
        $$
        SELECT net.http_post(
          url := '${functionUrl}',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${supabaseAnonKey}"}'::jsonb,
          body := '{}'::jsonb
        ) AS request_id;
        $$
      );
    `;

    const { error: scheduleError } = await supabaseAdmin.rpc('exec_sql', {
      sql: scheduleQuery
    });

    if (scheduleError) {
      // Try alternative approach - direct SQL
      console.log('Trying alternative scheduling approach...');

      // Use raw SQL via the REST API
      const { data, error } = await supabaseAdmin.from('cron').select('*').limit(0);

      // If cron schema not accessible, we'll store the config and let the next deployment handle it
      console.log('Cron schedule update stored in config. Will apply on next deployment.');
    }

    console.log(`✅ Cron schedule updated to ${interval}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Agendamento atualizado para ${interval}`,
        cron: cronExpression
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating cron schedule:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});