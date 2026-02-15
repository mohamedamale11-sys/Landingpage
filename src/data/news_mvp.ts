export type NewsSource = 'CoinDesk' | 'The Block' | 'Decrypt' | 'DL News' | 'Unchained' | 'CoinTelegraph'

export type NewsItem = {
  id: string
  title: string
  source: NewsSource
  publishedIso: string
  url: string
  badges?: string[]
  tone?: 'neutral' | 'hot' | 'sponsored'
  image_url?: string
  reading_time?: string
}

const iso = (d: string) => new Date(d).toISOString()

// UI seed items so the widget looks populated even if RSS is empty.
export const NEWS_SEED: NewsItem[] = [
  {
    id: 'n1',
    title: 'Teens face felony charges after 600-mile drive to allegedly attempt a $66M crypto robbery: reports',
    source: 'The Block',
    publishedIso: iso('2026-02-08T12:05:00Z'),
    url: 'https://example.com/theblock/story',
    badges: ['Crime'],
    tone: 'hot',
  },
  {
    id: 'n2',
    title: 'The most surprising Bitcoin and crypto stories in the Epstein files',
    source: 'Decrypt',
    publishedIso: iso('2026-02-08T11:30:00Z'),
    url: 'https://example.com/decrypt/story',
    badges: ['Weekend'],
    tone: 'neutral',
  },
  {
    id: 'n3',
    title: 'Tether helped Turkish investigators by freezing half a billion dollars in crypto: report',
    source: 'DL News',
    publishedIso: iso('2026-02-08T11:10:00Z'),
    url: 'https://example.com/dlnews/story',
    badges: ['Stablecoins'],
    tone: 'neutral',
  },
  {
    id: 'n4',
    title: 'Why machine-to-machine payments are the new electricity for the digital age',
    source: 'CoinDesk',
    publishedIso: iso('2026-02-08T10:40:00Z'),
    url: 'https://example.com/coindesk/story',
    badges: ['Opinion'],
    tone: 'neutral',
  },
  {
    id: 'n5',
    title: 'SOL-focused treasury firm says it is positioned for success after a tough run',
    source: 'CoinDesk',
    publishedIso: iso('2026-02-08T10:20:00Z'),
    url: 'https://example.com/coindesk/sol',
    badges: ['Solana'],
    tone: 'neutral',
  },
  {
    id: 'n6',
    title: 'Sponsored: How wallets can scale in 2026: integrations, not in-house builds',
    source: 'CoinDesk',
    publishedIso: iso('2026-02-08T09:55:00Z'),
    url: 'https://example.com/sponsored',
    badges: ['Sponsored'],
    tone: 'sponsored',
  },
  {
    id: 'n7',
    title: 'Bitcoin drifts into a conviction zone as spot bids return',
    source: 'CoinTelegraph',
    publishedIso: iso('2026-02-08T09:25:00Z'),
    url: 'https://example.com/ct/story',
    badges: ['Markets'],
    tone: 'neutral',
  },
  {
    id: 'n8',
    title: 'Arthur Hayes links February drop to ETF-driven hedging flows',
    source: 'Unchained',
    publishedIso: iso('2026-02-08T09:05:00Z'),
    url: 'https://example.com/unchained/story',
    badges: ['Flows'],
    tone: 'neutral',
  },
]

