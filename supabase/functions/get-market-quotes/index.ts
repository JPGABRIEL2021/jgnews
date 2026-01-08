import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchCurrencyQuotes() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL',
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Currency API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return null;
  }
}

async function fetchIbovespa() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Yahoo Finance API for IBOVESPA (^BVSP)
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=1d&range=1d',
      { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Yahoo API error:', response.status);
      return null;
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    
    if (!result) {
      console.error('No Ibovespa data in response');
      return null;
    }

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    const change = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

    return {
      price: currentPrice,
      change: change
    };
  } catch (error) {
    console.error('Error fetching Ibovespa:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch both APIs in parallel
    const [currencyData, ibovespaData] = await Promise.all([
      fetchCurrencyQuotes(),
      fetchIbovespa()
    ]);

    const quotes = [];

    // Add currency quotes
    if (currencyData) {
      if (currencyData.USDBRL) {
        quotes.push({
          name: 'Dólar',
          symbol: 'USD',
          value: parseFloat(currencyData.USDBRL.bid).toFixed(2),
          change: parseFloat(currencyData.USDBRL.pctChange || '0'),
          formatted: `R$ ${parseFloat(currencyData.USDBRL.bid).toFixed(2)}`,
        });
      }

      if (currencyData.EURBRL) {
        quotes.push({
          name: 'Euro',
          symbol: 'EUR',
          value: parseFloat(currencyData.EURBRL.bid).toFixed(2),
          change: parseFloat(currencyData.EURBRL.pctChange || '0'),
          formatted: `R$ ${parseFloat(currencyData.EURBRL.bid).toFixed(2)}`,
        });
      }
    }

    // Add Ibovespa
    if (ibovespaData) {
      const formattedPrice = Math.round(ibovespaData.price).toLocaleString('pt-BR');
      quotes.push({
        name: 'Ibovespa',
        symbol: 'IBOV',
        value: ibovespaData.price.toFixed(0),
        change: parseFloat(ibovespaData.change.toFixed(2)),
        formatted: formattedPrice,
      });
    } else {
      // Fallback Ibovespa
      quotes.push({
        name: 'Ibovespa',
        symbol: 'IBOV',
        value: '119450',
        change: 0.85,
        formatted: '119.450',
      });
    }

    // Add Bitcoin
    if (currencyData?.BTCBRL) {
      quotes.push({
        name: 'Bitcoin',
        symbol: 'BTC',
        value: parseFloat(currencyData.BTCBRL.bid).toFixed(0),
        change: parseFloat(currencyData.BTCBRL.pctChange || '0'),
        formatted: `R$ ${parseInt(currencyData.BTCBRL.bid).toLocaleString('pt-BR')}`,
      });
    }

    // If no quotes, return fallback
    if (quotes.length === 0) {
      return new Response(
        JSON.stringify({
          quotes: [
            { name: 'Dólar', symbol: 'USD', value: '6.18', change: 0.32, formatted: 'R$ 6.18' },
            { name: 'Euro', symbol: 'EUR', value: '6.42', change: -0.15, formatted: 'R$ 6.42' },
            { name: 'Ibovespa', symbol: 'IBOV', value: '119450', change: 0.85, formatted: '119.450' },
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
    console.error('Error in get-market-quotes:', error);
    
    return new Response(
      JSON.stringify({
        quotes: [
          { name: 'Dólar', symbol: 'USD', value: '6.18', change: 0.32, formatted: 'R$ 6.18' },
          { name: 'Euro', symbol: 'EUR', value: '6.42', change: -0.15, formatted: 'R$ 6.42' },
          { name: 'Ibovespa', symbol: 'IBOV', value: '119450', change: 0.85, formatted: '119.450' },
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
