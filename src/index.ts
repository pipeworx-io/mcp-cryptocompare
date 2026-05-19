interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * CryptoCompare MCP.
 */


const BASE = 'https://min-api.cryptocompare.com';
const UA = 'pipeworx-mcp-cryptocompare/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'price',
    description: 'Current price (one coin → many fiat).',
    inputSchema: { type: 'object', properties: { fsym: { type: 'string' }, tsyms: { type: 'string' }, e: { type: 'string' }, extraParams: { type: 'string' }, sign: { type: 'boolean' } }, required: ['fsym', 'tsyms'] },
  },
  {
    name: 'price_multi',
    description: 'Current price (many → many).',
    inputSchema: { type: 'object', properties: { fsyms: { type: 'string' }, tsyms: { type: 'string' }, e: { type: 'string' }, extraParams: { type: 'string' }, sign: { type: 'boolean' } }, required: ['fsyms', 'tsyms'] },
  },
  { name: 'price_full', description: 'Full snapshot.', inputSchema: { type: 'object', properties: { fsyms: { type: 'string' }, tsyms: { type: 'string' }, e: { type: 'string' } }, required: ['fsyms', 'tsyms'] } },
  {
    name: 'histo_minute',
    description: 'Minute OHLC.',
    inputSchema: { type: 'object', properties: { fsym: { type: 'string' }, tsym: { type: 'string' }, limit: { type: 'number' }, aggregate: { type: 'number' }, toTs: { type: 'number' }, e: { type: 'string' } }, required: ['fsym', 'tsym'] },
  },
  {
    name: 'histo_hour',
    description: 'Hourly OHLC.',
    inputSchema: { type: 'object', properties: { fsym: { type: 'string' }, tsym: { type: 'string' }, limit: { type: 'number' }, aggregate: { type: 'number' }, toTs: { type: 'number' }, e: { type: 'string' } }, required: ['fsym', 'tsym'] },
  },
  {
    name: 'histo_day',
    description: 'Daily OHLC.',
    inputSchema: { type: 'object', properties: { fsym: { type: 'string' }, tsym: { type: 'string' }, limit: { type: 'number' }, aggregate: { type: 'number' }, toTs: { type: 'number' }, e: { type: 'string' } }, required: ['fsym', 'tsym'] },
  },
  { name: 'top_pairs', description: 'Top trading pairs.', inputSchema: { type: 'object', properties: { fsym: { type: 'string' }, limit: { type: 'number' } }, required: ['fsym'] } },
  { name: 'top_volume_full', description: 'Top by volume.', inputSchema: { type: 'object', properties: { tsym: { type: 'string' }, limit: { type: 'number' }, page: { type: 'number' } }, required: ['tsym'] } },
  { name: 'top_market_cap', description: 'Top by market cap.', inputSchema: { type: 'object', properties: { limit: { type: 'number' }, tsym: { type: 'string' }, page: { type: 'number' } } } },
  {
    name: 'news',
    description: 'News feed.',
    inputSchema: { type: 'object', properties: { lang: { type: 'string' }, sortOrder: { type: 'string' }, lTs: { type: 'number' }, feeds: { type: 'string' }, categories: { type: 'string' }, excludeCategories: { type: 'string' } } },
  },
  { name: 'news_categories', description: 'News categories.', inputSchema: { type: 'object', properties: {} } },
  { name: 'news_feeds', description: 'News feeds.', inputSchema: { type: 'object', properties: {} } },
  { name: 'social_stats', description: 'Social stats.', inputSchema: { type: 'object', properties: { coinId: { type: 'number' } }, required: ['coinId'] } },
  { name: 'all_coins', description: 'Full coin list.', inputSchema: { type: 'object', properties: {} } },
  { name: 'all_exchanges', description: 'Exchange list.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('CryptoCompare requires an API key. Set PLATFORM_CRYPTOCOMPARE_KEY or pass ?_apiKey=… (free at https://www.cryptocompare.com/cryptopian/api-keys).');
  const get = async (path: string, extras: Record<string, unknown> = {}) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(extras)) {
      if (k === '_apiKey' || v == null) continue;
      p.set(k, String(v));
    }
    const url = `${BASE}${path}${[...p].length ? `?${p}` : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA, authorization: `Apikey ${apiKey}` } });
    if (res.status === 401 || res.status === 403) throw new Error('CryptoCompare: invalid API key.');
    if (!res.ok) throw new Error(`CryptoCompare: ${res.status}`);
    return res.json();
  };
  const pick = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, args[k]]));
  switch (name) {
    case 'price':
      return get('/data/price', pick(['fsym', 'tsyms', 'e', 'extraParams', 'sign']));
    case 'price_multi':
      return get('/data/pricemulti', pick(['fsyms', 'tsyms', 'e', 'extraParams', 'sign']));
    case 'price_full':
      return get('/data/pricemultifull', pick(['fsyms', 'tsyms', 'e']));
    case 'histo_minute':
      return get('/data/v2/histominute', pick(['fsym', 'tsym', 'limit', 'aggregate', 'toTs', 'e']));
    case 'histo_hour':
      return get('/data/v2/histohour', pick(['fsym', 'tsym', 'limit', 'aggregate', 'toTs', 'e']));
    case 'histo_day':
      return get('/data/v2/histoday', pick(['fsym', 'tsym', 'limit', 'aggregate', 'toTs', 'e']));
    case 'top_pairs':
      return get('/data/top/pairs', pick(['fsym', 'limit']));
    case 'top_volume_full':
      return get('/data/top/totalvolfull', pick(['tsym', 'limit', 'page']));
    case 'top_market_cap':
      return get('/data/top/mktcapfull', pick(['limit', 'tsym', 'page']));
    case 'news':
      return get('/data/v2/news/', pick(['lang', 'sortOrder', 'lTs', 'feeds', 'categories', 'excludeCategories']));
    case 'news_categories':
      return get('/data/news/categories');
    case 'news_feeds':
      return get('/data/news/feeds');
    case 'social_stats':
      return get('/data/social/coin/latest', pick(['coinId']));
    case 'all_coins':
      return get('/data/all/coinlist');
    case 'all_exchanges':
      return get('/data/exchanges/general');
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
