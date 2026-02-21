import type { FlowListItem, FlowSnapshot } from './flow'

function getAPIBase(): string {
  const base = (import.meta.env.VITE_API_BASE || '').toString().trim()
  if (base) return base.replace(/\/+$/, '')
  if (import.meta.env.DEV) return ''
  return 'https://mxcrypto-backend-1.onrender.com'
}

const API_BASE = getAPIBase()

interface TokenFlowAggregate {
  mint: string
  token_name?: string | null
  token_symbol?: string | null
  image_url?: string | null
  net_sol: number
  buy_sol: number
  sell_sol: number
  trade_count?: number
  price_usd?: number | null
  market_cap_usd?: number | null
  liquidity_usd?: number | null
}

interface OverviewStatsResponse {
  ok: boolean
  stats: {
    window_hours: number
    total_trades: number
    unique_wallets: number
    active_wallets: number
    top_inflow: TokenFlowAggregate[]
    top_outflow: TokenFlowAggregate[]
  }
}

interface TokenFlowResponse {
  ok: boolean
  window_hours: number
  top_inflow: TokenFlowAggregate[]
  top_outflow: TokenFlowAggregate[]
  stale: boolean
}

interface FeedTradeRecord {
  id: number
  block_time: string
  trader: string
  side: string
  mint: string
  sol_amount: number
  token_name?: string | null
  token_symbol?: string | null
  image_url?: string | null
  wallet_name?: string | null
  wallet_category?: string | null
  price_usd?: number | null
}

interface FeedResponse {
  ok: boolean
  stale?: boolean
  items: FeedTradeRecord[]
}

export type FeedTradeItem = {
  id: number
  blockTime: string
  wallet: string
  walletCategory: string
  side: string
  mint: string
  symbol: string
  name: string
  imageUrl: string
  solAmount: number
  priceUsd: number | null
}

export type WhaleHoldingRow = {
  mint: string
  chain: 'solana'
  symbol: string
  name: string
  imageUrl: string
  buySOL: number
  sellSOL: number
  netSOL: number
  tradeCount: number
  priceUsd: number | null
  marketCapUsd: number | null
  liquidityUsd: number | null
  flowSide: 'inflow' | 'outflow'
}

function asFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function pickString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function aggToFlowItem(agg: TokenFlowAggregate): FlowListItem {
  const symbol = pickString(agg.token_symbol, '') || agg.mint.slice(0, 6).toUpperCase()
  const name = pickString(agg.token_name, symbol)
  const netSOL = Math.abs(asFiniteNumber(agg.net_sol))

  return {
    title: symbol,
    subtitle: name,
    valueSOL: netSOL,
    rawValue: `${netSOL.toFixed(1)} SOL`,
  }
}

function mapFeedTrade(item: FeedTradeRecord): FeedTradeItem {
  const symbol = pickString(item.token_symbol, '') || pickString(item.mint, '').slice(0, 6).toUpperCase() || 'TOKEN'
  const name = pickString(item.token_name, symbol)
  const walletName = pickString(item.wallet_name, '')
  const trader = pickString(item.trader, 'Unknown wallet')

  return {
    id: Number.isFinite(item.id) ? item.id : Date.now(),
    blockTime: pickString(item.block_time, new Date().toISOString()),
    wallet: walletName || trader,
    walletCategory: pickString(item.wallet_category, ''),
    side: pickString(item.side, 'unknown').toLowerCase(),
    mint: pickString(item.mint, ''),
    symbol,
    name,
    imageUrl: pickString(item.image_url, ''),
    solAmount: asFiniteNumber(item.sol_amount),
    priceUsd: item.price_usd == null ? null : asFiniteNumber(item.price_usd),
  }
}

function aggToWhaleRow(agg: TokenFlowAggregate, side: 'inflow' | 'outflow'): WhaleHoldingRow {
  const symbol = pickString(agg.token_symbol, '') || pickString(agg.mint, '').slice(0, 6).toUpperCase() || 'TOKEN'
  const name = pickString(agg.token_name, symbol)
  return {
    mint: pickString(agg.mint, ''),
    chain: 'solana',
    symbol,
    name,
    imageUrl: pickString(agg.image_url, ''),
    buySOL: asFiniteNumber(agg.buy_sol),
    sellSOL: asFiniteNumber(agg.sell_sol),
    netSOL: asFiniteNumber(agg.net_sol),
    tradeCount: asFiniteNumber(agg.trade_count),
    priceUsd: agg.price_usd == null ? null : asFiniteNumber(agg.price_usd),
    marketCapUsd: agg.market_cap_usd == null ? null : asFiniteNumber(agg.market_cap_usd),
    liquidityUsd: agg.liquidity_usd == null ? null : asFiniteNumber(agg.liquidity_usd),
    flowSide: side,
  }
}

export async function fetchTokenFlow(windowHours = 24, limit = 10): Promise<{
  inflow: FlowListItem[]
  outflow: FlowListItem[]
  stale: boolean
}> {
  const url = `${API_BASE}/api/web/token-flow?window_hours=${windowHours}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`token-flow: ${res.status}`)
  const data: TokenFlowResponse = await res.json()
  return {
    inflow: (data.top_inflow || []).map(aggToFlowItem),
    outflow: (data.top_outflow || []).map(aggToFlowItem),
    stale: !!data.stale,
  }
}

export async function fetchWhaleHoldings(windowHours = 24, limit = 30): Promise<WhaleHoldingRow[]> {
  const url = `${API_BASE}/api/web/token-flow?window_hours=${windowHours}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`token-flow: ${res.status}`)
  const data: TokenFlowResponse = await res.json()

  const merged = new Map<string, WhaleHoldingRow>()
  for (const agg of data.top_inflow || []) {
    const row = aggToWhaleRow(agg, 'inflow')
    if (!row.mint) continue
    merged.set(row.mint, row)
  }
  for (const agg of data.top_outflow || []) {
    const row = aggToWhaleRow(agg, 'outflow')
    if (!row.mint) continue
    if (!merged.has(row.mint)) {
      merged.set(row.mint, row)
      continue
    }
    // Keep the row with larger absolute net flow.
    const prev = merged.get(row.mint)!
    if (Math.abs(row.netSOL) > Math.abs(prev.netSOL)) merged.set(row.mint, row)
  }

  return Array.from(merged.values()).sort((a, b) => Math.abs(b.netSOL) - Math.abs(a.netSOL))
}

export async function fetchOverview(windowHours = 24): Promise<{
  totalTrades: number
  uniqueWallets: number
  activeWallets: number
  inflow: FlowListItem[]
  outflow: FlowListItem[]
}> {
  const url = `${API_BASE}/api/web/overview?window_hours=${windowHours}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`overview: ${res.status}`)
  const data: OverviewStatsResponse = await res.json()
  const s = data.stats
  return {
    totalTrades: asFiniteNumber(s.total_trades),
    uniqueWallets: asFiniteNumber(s.unique_wallets),
    activeWallets: asFiniteNumber(s.active_wallets),
    inflow: (s.top_inflow || []).map(aggToFlowItem),
    outflow: (s.top_outflow || []).map(aggToFlowItem),
  }
}

export async function fetchFeed(limit = 40): Promise<FeedTradeItem[]> {
  const url = `${API_BASE}/api/web/feed?limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`feed: ${res.status}`)
  const data: FeedResponse = await res.json()
  return (data.items || []).map(mapFeedTrade)
}

export async function fetchLiveFlowData(windowHours = 24): Promise<FlowSnapshot> {
  const [flow, overview] = await Promise.all([
    fetchTokenFlow(windowHours, 10),
    fetchOverview(windowHours),
  ])

  return {
    windowHours,
    updatedAt: Date.now(),
    inflow: flow.inflow.length > 0 ? flow.inflow : overview.inflow,
    outflow: flow.outflow.length > 0 ? flow.outflow : overview.outflow,
    metrics: {
      totalTrades: overview.totalTrades,
      uniqueWallets: overview.uniqueWallets,
      activeWallets: overview.activeWallets,
    },
  }
}
