export type Category =
  | 'Bitcoin'
  | 'Ethereum'
  | 'DeFi'
  | 'Policy'
  | 'Web3'
  | 'Memecoins'
  | 'Research'

export type Article = {
  id: string
  slug: string
  title: string
  dek: string
  category: Category
  tags: string[]
  author: string
  minutesToRead: number
  publishedIso: string
  heroTone: 'gold' | 'slate' | 'ink' | 'sky'
  content: string[]
}

const iso = (d: string) => new Date(d).toISOString()

export const ARTICLES: Article[] = [
  {
    id: 'a1',
    slug: 'bitcoin-rallies-as-risk-sentiment-improves',
    title: 'Bitcoin rallies as risk sentiment improves across majors',
    dek: 'A broad move higher lifts large caps while traders watch leverage build in derivatives.',
    category: 'Bitcoin',
    tags: ['BTC', 'Derivatives', 'Macro'],
    author: 'MxCrypto Desk',
    minutesToRead: 3,
    publishedIso: iso('2026-02-08T08:40:00Z'),
    heroTone: 'gold',
    content: [
      'Bitcoin moved higher into the session as traders leaned into risk, with large caps outperforming.',
      'Derivatives open interest rose alongside spot volume, suggesting fresh positioning rather than thin liquidity.',
      'Analysts cautioned that funding rates and liquidation clusters remain key to watch if the move extends.',
    ],
  },
  {
    id: 'a2',
    slug: 'ethereum-fees-cool-while-l2-activity-climbs',
    title: 'Ethereum fees cool while L2 activity climbs',
    dek: 'Lower base-layer fees coincide with steadier throughput across rollups and app chains.',
    category: 'Ethereum',
    tags: ['ETH', 'L2', 'Fees'],
    author: 'Research Editor',
    minutesToRead: 4,
    publishedIso: iso('2026-02-08T07:55:00Z'),
    heroTone: 'ink',
    content: [
      'Network fee pressure eased as users shifted activity across L2s and cheaper venues.',
      'Rollups continued to absorb demand, with bridging flows stable across major routes.',
      'Builders highlighted upcoming upgrades focused on data availability and execution efficiency.',
    ],
  },
  {
    id: 'a3',
    slug: 'defi-yields-compress-on-blue-chip-pools',
    title: 'DeFi yields compress on blue-chip pools',
    dek: 'Stablecoin supply rates drift lower as demand for leverage holds steady on perps.',
    category: 'DeFi',
    tags: ['DeFi', 'Stables', 'Aave'],
    author: 'Markets Reporter',
    minutesToRead: 5,
    publishedIso: iso('2026-02-08T07:20:00Z'),
    heroTone: 'slate',
    content: [
      'Supply-side rates dipped across several large pools as liquidity deepened and borrow demand normalized.',
      'On the demand side, perp venues showed steady open interest, pointing to persistent leverage appetite.',
      'Traders are watching whether incentive programs re-accelerate yields in riskier strategies.',
    ],
  },
  {
    id: 'a4',
    slug: 'memecoin-launches-dominate-24-hour-mindshare',
    title: 'Memecoin launches dominate 24-hour mindshare, but survivorship stays low',
    dek: 'New pairs spike quickly as attention concentrates, then fades without sustained liquidity.',
    category: 'Memecoins',
    tags: ['Memecoins', 'Liquidity', 'Trends'],
    author: 'Community Desk',
    minutesToRead: 3,
    publishedIso: iso('2026-02-08T06:35:00Z'),
    heroTone: 'sky',
    content: [
      'Short-lived attention cycles drove sharp bursts in volume for new meme pairs.',
      'Liquidity conditions remain uneven, with spreads widening quickly after the first wave of activity.',
      'Risk teams recommend strict sizing rules and exit plans in highly reflexive markets.',
    ],
  },
  {
    id: 'a5',
    slug: 'policy-watch-stablecoin-talks-return-to-center-stage',
    title: 'Policy watch: stablecoin talks return to center stage',
    dek: 'Regulators signal renewed focus on issuer transparency and onshore compliance pathways.',
    category: 'Policy',
    tags: ['Policy', 'Stablecoins', 'Regulation'],
    author: 'Policy Correspondent',
    minutesToRead: 6,
    publishedIso: iso('2026-02-08T05:50:00Z'),
    heroTone: 'slate',
    content: [
      'Stablecoin policy discussions resurfaced as officials emphasized reserve clarity and audit standards.',
      'Industry participants argued for rules that preserve open settlement and market competition.',
      'Timelines and details remain fluid, but messaging suggests a more active posture in coming weeks.',
    ],
  },
]

export function getArticleBySlug(slug: string) {
  return ARTICLES.find((a) => a.slug === slug) ?? null
}
