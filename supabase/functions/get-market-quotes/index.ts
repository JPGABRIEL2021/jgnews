import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteResponse {
  [key: string]: {
    code: string;
    codein: string;
    name: string;
    high: string;
    low: string;
    varBid: string;
    pctChange: string;
    bid: string;
    ask: string;
    timestamp: string;
    create_date: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch currency data from AwesomeAPI (free, no API key needed)
    const response = await fetch(
      'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch quotes');
    }

    const data: QuoteResponse = await response.json();

    // Format the response
    const quotes = [
      {
        name: 'Dólar',
        symbol: 'USD',
        value: parseFloat(data['USDBRL'].bid).toFixed(2),
        change: parseFloat(data['USDBRL'].pctChange),
        formatted: `R$ ${parseFloat(data['USDBRL'].bid).toFixed(2)}`,
      },
      {
        name: 'Euro',
        symbol: 'EUR',
        value: parseFloat(data['EURBRL'].bid).toFixed(2),
        change: parseFloat(data['EURBRL'].pctChange),
        formatted: `R$ ${parseFloat(data['EURBRL'].bid).toFixed(2)}`,
      },
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        value: parseFloat(data['BTCBRL'].bid).toFixed(0),
        change: parseFloat(data['BTCBRL'].pctChange),
        formatted: `R$ ${parseInt(data['BTCBRL'].bid).toLocaleString('pt-BR')}`,
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        value: parseFloat(data['ETHBRL'].bid).toFixed(0),
        change: parseFloat(data['ETHBRL'].pctChange),
        formatted: `R$ ${parseInt(data['ETHBRL'].bid).toLocaleString('pt-BR')}`,
      },
    ];

    return new Response(
      JSON.stringify({ quotes, timestamp: new Date().toISOString() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch market data' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
