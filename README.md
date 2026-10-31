# @pipeworx/cryptocompare

[CoinDesk Data](https://developers.coindesk.com/) (formerly CryptoCompare / CCData) MCP —
crypto prices, OHLC history, social stats, news.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1863+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

The vendor renamed twice: `developers.ccdata.io` 301s to `developers.coindesk.com`, and
min-api's own 401 body points callers there. The legacy data host
`min-api.cryptocompare.com` still serves and is what this pack calls;
`data-api.coindesk.com` is the current host.

**BYOK-only since 2026-09-30 (fleet #2444).** The shared platform key was permanently over
quota — every tool authenticated but returned the vendor body `"You are over your rate limit
please upgrade your account!"` (472 calls/30d, all soft-failing). Bruce ruled `byok`: bring
your own CoinDesk Data key. `platformKeyEnv` was removed from the gateway manifest, so Pipeworx
no longer fronts any key for this pack — every tool requires `_apiKey` and refuses cleanly
(`{found:false, reason:"missing_api_key", …}`) without one. No plan or quota is quoted here
because CoinDesk Data's pricing page no longer publishes one without an account — see
<https://developers.coindesk.com/pricing/>.

Without your own key, use the `crypto` pack (`get_crypto_price`) for current prices and daily
history, or `crypto-feeds` for crypto news.

## Auth

Bring your own CoinDesk Data key: pass it as `_apiKey` on every call. Free signup at
<https://developers.coindesk.com/>. Pipeworx does not supply a shared key for this pack.

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

## Data sources

- API: `https://min-api.cryptocompare.com` (legacy host, still live; current host is `https://data-api.coindesk.com`)
- Docs + keys: <https://developers.coindesk.com/>

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/cryptocompare/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1863+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/cryptocompare_price`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-cryptocompare` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/cryptocompare/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "cryptocompare": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-cryptocompare"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Cryptocompare data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
