import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

async function fetchYahooIndex(symbol: string, name: string, displaySymbol: string, isCurrency = false): Promise<any> {
  try {
    const response = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`
    )
    
    if (!response.ok) {
      console.error(`Yahoo error for ${symbol}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    const result = data?.chart?.result?.[0]
    
    if (!result) return null
    
    const meta = result.meta
    const currentPrice = meta.regularMarketPrice
    const previousClose = meta.chartPreviousClose || meta.previousClose
    
    if (!currentPrice || !previousClose) return null
    
    const change = ((currentPrice - previousClose) / previousClose) * 100
    
    let formatted: string
    if (isCurrency) {
      formatted = `R$ ${currentPrice.toFixed(2)}`
    } else if (currentPrice >= 10000) {
      formatted = Math.round(currentPrice).toLocaleString('pt-BR')
    } else {
      formatted = currentPrice.toFixed(2).replace('.', ',')
    }
    
    return {
      name,
      symbol: displaySymbol,
      value: currentPrice,
      change: parseFloat(change.toFixed(2)),
      formatted
    }
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching market quotes...')
    
    // Fetch all indices in parallel from Yahoo Finance
    const [usd, eur, ibov, sp500, nasdaq, dowjones, btc] = await Promise.all([
      fetchYahooIndex('BRL=X', 'Dólar', 'USD', true),
      fetchYahooIndex('EURBRL=X', 'Euro', 'EUR', true),
      fetchYahooIndex('^BVSP', 'Ibovespa', 'IBOV'),
      fetchYahooIndex('^GSPC', 'S&P 500', 'SPX'),
      fetchYahooIndex('^IXIC', 'Nasdaq', 'NDX'),
      fetchYahooIndex('^DJI', 'Dow Jones', 'DJI'),
      fetchYahooIndex('BTC-USD', 'Bitcoin', 'BTC')
    ])
    
    const quotes: any[] = []
    
    // Add in order: currencies, indices, crypto
    if (usd) quotes.push(usd)
    if (eur) quotes.push(eur)
    if (ibov) quotes.push(ibov)
    if (sp500) quotes.push(sp500)
    if (nasdaq) quotes.push(nasdaq)
    if (dowjones) quotes.push(dowjones)
    if (btc) {
      // Format BTC in USD
      btc.formatted = `$ ${Math.round(btc.value).toLocaleString('en-US')}`
      quotes.push(btc)
    }
    
    console.log(`Got ${quotes.length} quotes from Yahoo Finance`)
    
    // Fallback if no quotes
    if (quotes.length === 0) {
      console.log('Using fallback data')
      return new Response(
        JSON.stringify({
          quotes: [
            { name: 'Dólar', symbol: 'USD', value: 6.10, change: 0.15, formatted: 'R$ 6.10' },
            { name: 'Euro', symbol: 'EUR', value: 6.35, change: -0.08, formatted: 'R$ 6.35' },
            { name: 'Ibovespa', symbol: 'IBOV', value: 120500, change: 0.45, formatted: '120.500' },
            { name: 'S&P 500', symbol: 'SPX', value: 5950, change: 0.32, formatted: '5.950,00' },
            { name: 'Nasdaq', symbol: 'NDX', value: 19200, change: 0.58, formatted: '19.200,00' },
            { name: 'Dow Jones', symbol: 'DJI', value: 42500, change: 0.28, formatted: '42.500' },
            { name: 'Bitcoin', symbol: 'BTC', value: 98500, change: 1.25, formatted: '$ 98,500' }
          ],
          timestamp: new Date().toISOString(),
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ quotes, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-market-quotes:', error)
    
    return new Response(
      JSON.stringify({
        quotes: [
          { name: 'Dólar', symbol: 'USD', value: 6.10, change: 0.15, formatted: 'R$ 6.10' },
          { name: 'Ibovespa', symbol: 'IBOV', value: 120500, change: 0.45, formatted: '120.500' },
          { name: 'S&P 500', symbol: 'SPX', value: 5950, change: 0.32, formatted: '5.950,00' },
          { name: 'Bitcoin', symbol: 'BTC', value: 98500, change: 1.25, formatted: '$ 98,500' }
        ],
        timestamp: new Date().toISOString(),
        fallback: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
