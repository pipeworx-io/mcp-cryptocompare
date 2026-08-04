# @pipeworx/cryptocompare

[CryptoCompare](https://min-api.cryptocompare.com/) MCP — crypto prices, OHLC history, social stats, news. Free key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Platform: `PLATFORM_CRYPTOCOMPARE_KEY`. BYO: `?_apiKey=…`.

## Tools

- `price(fsym, tsyms, e?, extraParams?, sign?)` — current price (one coin → many fiat)
- `price_multi(fsyms, tsyms, e?, extraParams?, sign?)` — current price (many → many)
- `price_full(fsyms, tsyms, e?)` — full snapshot (24h vol, etc.)
- `histo_minute(fsym, tsym, limit?, aggregate?, toTs?, e?)` — minute OHLC
- `histo_hour(fsym, tsym, limit?, aggregate?, toTs?, e?)` — hourly OHLC
- `histo_day(fsym, tsym, limit?, aggregate?, toTs?, e?)` — daily OHLC
- `top_pairs(fsym, limit?)` — top trading pairs
- `top_volume_full(tsym, limit?, page?)` — top by volume
- `top_market_cap(limit?, tsym?, page?)` — top by market cap
- `news(lang?, sortOrder?, lTs?, feeds?, categories?, excludeCategories?)` — news feed
- `news_categories()` — news categories
- `news_feeds()` — news feeds
- `social_stats(coinId)` — social stats by coin id
- `all_coins()` — full coin list
- `all_exchanges()` — exchange list

## Data source

`https://min-api.cryptocompare.com`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "cryptocompare": {
      "url": "https://gateway.pipeworx.io/cryptocompare/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Cryptocompare data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
