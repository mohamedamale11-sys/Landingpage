export type WireItem = {
  id: string
  title: string
  url: string
  summary?: string
  content?: string
  author?: string
  section?: string
  tags?: string[]
  image_url?: string
  published_at: string
  source: string
  reading_time?: string
}

export async function fetchLatest(limit = 60, signal?: AbortSignal) {
  const res = await fetch(`/api/news/latest?limit=${encodeURIComponent(String(limit))}`, { signal })
  if (!res.ok) throw new Error(`news api status ${res.status}`)
  const data = (await res.json()) as { ok: boolean; items?: WireItem[] }
  return data.items ?? []
}

export async function fetchNewsItemByURL(url: string, signal?: AbortSignal) {
  const res = await fetch(`/api/news/item?url=${encodeURIComponent(url)}`, { signal })
  if (!res.ok) {
    if (res.status === 404) throw new Error('Story not found in the current feed window.')
    throw new Error(`news item status ${res.status}`)
  }
  const data = (await res.json()) as { ok: boolean; item?: WireItem }
  if (!data.item) throw new Error('news item missing')
  return data.item
}
