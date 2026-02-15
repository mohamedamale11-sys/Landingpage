export type ExchangeLink = {
  id: 'binance' | 'bybit' | 'okx' | 'coinbase'
  name: string
  blurb: string
  cta: string
  href: string
  badge?: string
}

// TODO: Replace `href` values with your real affiliate / tracking URLs.
export const EXCHANGES: ExchangeLink[] = [
  {
    id: 'binance',
    name: 'Binance',
    blurb: 'Deep liquidity, broad listings.',
    cta: 'Trade on Binance',
    href: 'https://example.com/?ref=mxcrypto-binance',
    badge: 'Popular',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    blurb: 'Derivatives and active traders.',
    cta: 'Open Bybit',
    href: 'https://example.com/?ref=mxcrypto-bybit',
  },
  {
    id: 'okx',
    name: 'OKX',
    blurb: 'Spot + perps + earn.',
    cta: 'Go to OKX',
    href: 'https://example.com/?ref=mxcrypto-okx',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    blurb: 'Simple onramp and custody.',
    cta: 'Try Coinbase',
    href: 'https://example.com/?ref=mxcrypto-coinbase',
  },
]

