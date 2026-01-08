import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch currency data from AwesomeAPI (free, no API key needed)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL',
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('API data received:', JSON.stringify(data));

    // Format the response
    const quotes = [];

    if (data.USDBRL) {
      quotes.push({
        name: 'Dólar',
        symbol: 'USD',
        value: parseFloat(data.USDBRL.bid).toFixed(2),
        change: parseFloat(data.USDBRL.pctChange || '0'),
        formatted: `R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}`,
      });
    }

    if (data.EURBRL) {
      quotes.push({
        name: 'Euro',
        symbol: 'EUR',
        value: parseFloat(data.EURBRL.bid).toFixed(2),
        change: parseFloat(data.EURBRL.pctChange || '0'),
        formatted: `R$ ${parseFloat(data.EURBRL.bid).toFixed(2)}`,
      });
    }

    if (data.BTCBRL) {
      quotes.push({
        name: 'Bitcoin',
        symbol: 'BTC',
        value: parseFloat(data.BTCBRL.bid).toFixed(0),
        change: parseFloat(data.BTCBRL.pctChange || '0'),
        formatted: `R$ ${parseInt(data.BTCBRL.bid).toLocaleString('pt-BR')}`,
      });
    }

    // If no quotes were fetched, return fallback data
    if (quotes.length === 0) {
      console.log('No quotes fetched, returning fallback');
      return new Response(
        JSON.stringify({
          quotes: [
            { name: 'Dólar', symbol: 'USD', value: '6.18', change: 0.32, formatted: 'R$ 6.18' },
            { name: 'Euro', symbol: 'EUR', value: '6.42', change: -0.15, formatted: 'R$ 6.42' },
            { name: 'Bitcoin', symbol: 'BTC', value: '590000', change: 2.14, formatted: 'R$ 590.000' },
          ],
          timestamp: new Date().toISOString(),
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ quotes, timestamp: new Date().toISOString() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching quotes:', error);
    
    // Return fallback data instead of error
    return new Response(
      JSON.stringify({
        quotes: [
          { name: 'Dólar', symbol: 'USD', value: '6.18', change: 0.32, formatted: 'R$ 6.18' },
          { name: 'Euro', symbol: 'EUR', value: '6.42', change: -0.15, formatted: 'R$ 6.42' },
          { name: 'Bitcoin', symbol: 'BTC', value: '590000', change: 2.14, formatted: 'R$ 590.000' },
        ],
        timestamp: new Date().toISOString(),
        fallback: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
