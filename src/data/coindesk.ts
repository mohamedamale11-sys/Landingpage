export type CoinDeskItem = {
  id: string
  title: string
  url: string
  summary?: string
  author?: string
  section?: string
  image_url?: string
  published_at: string
  source: string
}

export async function fetchCoinDesk(limit = 30, signal?: AbortSignal) {
  const res = await fetch(`/api/news/coindesk?limit=${encodeURIComponent(String(limit))}`, { signal })
  if (!res.ok) throw new Error(`news api status ${res.status}`)
  const data = (await res.json()) as { ok: boolean; items?: CoinDeskItem[] }
  return data.items ?? []
}

