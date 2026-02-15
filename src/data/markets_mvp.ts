export type MarketRow = {
  symbol: string
  name: string
  priceUsd: number
  chg24hPct: number
  mcapUsd: number
  volume24hUsd: number
  history: number[]
}

const s = (seed: number) => {
  let x = seed
  const out: number[] = []
  for (let i = 0; i < 96; i++) {
    x = (x * 9301 + 49297) % 233280
    const r = x / 233280
    const drift = i / 96
    out.push(0.42 + r * 0.55 + drift * 0.18)
  }
  return out
}

export const MARKETS: MarketRow[] = [
  { symbol: 'BTC', name: 'Bitcoin', priceUsd: 69251.52, chg24hPct: -1.45, mcapUsd: 1.39e12, volume24hUsd: 18.4e9, history: s(11) },
  { symbol: 'ETH', name: 'Ethereum', priceUsd: 2085.01, chg24hPct: 1.47, mcapUsd: 253e9, volume24hUsd: 9.6e9, history: s(22) },
  { symbol: 'USDT', name: 'Tether', priceUsd: 1.0, chg24hPct: -0.01, mcapUsd: 186e9, volume24hUsd: 39.1e9, history: s(33) },
  { symbol: 'BNB', name: 'BNB', priceUsd: 645.85, chg24hPct: -1.57, mcapUsd: 88.44e9, volume24hUsd: 2.1e9, history: s(44) },
  { symbol: 'XRP', name: 'XRP', priceUsd: 1.43, chg24hPct: -2.24, mcapUsd: 87.27e9, volume24hUsd: 3.8e9, history: s(55) },
  { symbol: 'USDC', name: 'USDC', priceUsd: 1.0, chg24hPct: -0.04, mcapUsd: 72.48e9, volume24hUsd: 6.2e9, history: s(66) },
  { symbol: 'SOL', name: 'Solana', priceUsd: 87.07, chg24hPct: -0.01, mcapUsd: 49.71e9, volume24hUsd: 4.5e9, history: s(77) },
  { symbol: 'TRX', name: 'TRON', priceUsd: 0.277, chg24hPct: 1.28, mcapUsd: 26.27e9, volume24hUsd: 1.0e9, history: s(88) },
  { symbol: 'STETH', name: 'Lido Staked ETH', priceUsd: 2082.54, chg24hPct: 1.49, mcapUsd: 20.07e9, volume24hUsd: 0.4e9, history: s(99) },
  { symbol: 'ADA', name: 'Cardano', priceUsd: 0.493, chg24hPct: -2.01, mcapUsd: 17.2e9, volume24hUsd: 0.9e9, history: s(101) },
]

