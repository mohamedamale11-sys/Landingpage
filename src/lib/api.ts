import type { FlowListItem, FlowSnapshot } from './flow'

function getAPIBase(): string {
  const base = (import.meta.env.VITE_API_BASE || '').toString().trim()
  if (base) return base.replace(/\/+$/, '')
  // Default to hosted backend so local frontend works even when local API is not running.
  // Override with VITE_API_BASE=http://localhost:8000 when needed.
  return 'https://mxcrypto-backend-1.onrender.com'
}

const API_BASE = getAPIBase()
const REQUEST_TIMEOUT_MS = 12_000

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
  degraded?: boolean
  error?: string
  error_code?: string
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
  degraded?: boolean
  error?: string
  error_code?: string
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

type APIErrorPayload = {
  error?: string
  request_id?: string
}

class HTTPError extends Error {
  status: number
  retriable: boolean

  constructor(message: string, status: number, retriable: boolean) {
    super(message)
    this.name = 'HTTPError'
    this.status = status
    this.retriable = retriable
  }
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

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isRetriableStatus(status: number) {
  return status === 429 || status >= 500
}

function buildAPIError(label: string, status: number, payload?: APIErrorPayload) {
  const suffix = payload?.request_id ? ` (request ${payload.request_id})` : ''
  const message = payload?.error?.trim() || `${label}: ${status}`
  return new HTTPError(`${message}${suffix}`, status, isRetriableStatus(status))
}

async function fetchJSON<T>(path: string, label: string, retries = 1): Promise<T> {
  const url = `${API_BASE}${path}`
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (res.ok) {
        const data = (await res.json()) as T
        return data
      }
      let payload: APIErrorPayload | undefined
      try {
        payload = (await res.json()) as APIErrorPayload
      } catch {
        payload = undefined
      }
      const err = buildAPIError(label, res.status, payload)
      if (attempt < retries && isRetriableStatus(res.status)) {
        await delay(350 * (attempt + 1))
        lastError = err
        continue
      }
      throw err
    } catch (err) {
      if (err instanceof HTTPError) {
        if (attempt < retries && err.retriable) {
          await delay(350 * (attempt + 1))
          lastError = err
          continue
        }
        throw err
      }

      const isAbort = err instanceof DOMException ? err.name === 'AbortError' : false
      const message = err instanceof Error ? err.message : String(err)
      const wrapped = new Error(isAbort || message.includes('aborted') ? `${label}: request timeout` : message)
      if (attempt < retries && (isAbort || message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch'))) {
        await delay(350 * (attempt + 1))
        lastError = wrapped
        continue
      }
      throw wrapped
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError || new Error(`${label}: request failed`)
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
  const data = await fetchJSON<TokenFlowResponse>(`/api/web/token-flow?window_hours=${windowHours}&limit=${limit}`, 'token-flow', 1)
  if (data.degraded && (!data.top_inflow?.length && !data.top_outflow?.length)) {
    throw new Error(data.error?.trim() || 'Smart-money flow is temporarily unavailable.')
  }
  return {
    inflow: (data.top_inflow || []).map(aggToFlowItem),
    outflow: (data.top_outflow || []).map(aggToFlowItem),
    stale: !!data.stale,
  }
}

export async function fetchWhaleHoldings(windowHours = 24, limit = 30): Promise<WhaleHoldingRow[]> {
  const data = await fetchJSON<TokenFlowResponse>(`/api/web/token-flow?window_hours=${windowHours}&limit=${limit}`, 'token-flow', 1)
  if (data.degraded && (!data.top_inflow?.length && !data.top_outflow?.length)) {
    throw new Error(data.error?.trim() || 'Whale activity data is temporarily unavailable.')
  }

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
  const data = await fetchJSON<OverviewStatsResponse>(`/api/web/overview?window_hours=${windowHours}`, 'overview', 1)
  if (data.degraded) {
    throw new Error(data.error?.trim() || 'Overview data is temporarily unavailable.')
  }
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
  const data = await fetchJSON<FeedResponse>(`/api/web/feed?limit=${limit}`, 'feed', 1)
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
