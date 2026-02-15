import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES, type Article } from '../data/articles'
import { fetchLatest, type WireItem } from '../data/latest'
import { NewsWidget } from '../components/NewsWidget'
import { UnlocksWidget } from '../components/UnlocksWidget'
import { timeAgo } from '../lib/time'
import { NEWS_SEED, type NewsItem, type NewsSource } from '../data/news_mvp'

type Story =
  | { kind: 'mx'; id: string; title: string; dek: string; category: string; author: string; publishedIso: string; href: string }
  | { kind: 'external'; id: string; title: string; summary?: string; section?: string; author?: string; publishedIso: string; href: string; source: string; image_url?: string }

function toMx(a: Article): Story {
  return {
    kind: 'mx',
    id: a.id,
    title: a.title,
    dek: a.dek,
    category: a.category,
    author: a.author,
    publishedIso: a.publishedIso,
    href: `/article/${a.slug}`,
  }
}

function toExternal(a: WireItem): Story {
  return {
    kind: 'external',
    id: a.id || a.url,
    title: a.title,
    summary: a.summary,
    section: a.section,
    author: a.author,
    publishedIso: a.published_at,
    href: a.url,
    source: a.source || 'Wire',
    image_url: a.image_url,
  }
}

export function HomePage() {
  const [wire, setWire] = useState<WireItem[] | null>(null)

  const mxSorted = useMemo(() => [...ARTICLES].sort((a, b) => b.publishedIso.localeCompare(a.publishedIso)), [])

  useEffect(() => {
    const ac = new AbortController()
    fetchLatest(70, ac.signal)
      .then((items) => setWire(items))
      .catch(() => setWire([]))
    return () => ac.abort()
  }, [])

  const stories = useMemo(() => {
    const external = (wire ?? []).map(toExternal)
    const mx = external.length > 0 ? [] : mxSorted.map(toMx)
    return [...external, ...mx].sort((a, b) => b.publishedIso.localeCompare(a.publishedIso))
  }, [wire, mxSorted])

  const hero = stories[0] ?? null
  const top = stories.slice(1, 5)

  const newsItems: NewsItem[] = useMemo(() => {
    const fromRSS: NewsItem[] = (wire ?? []).map((x) => ({
      id: x.id || x.url,
      title: x.title,
      source: (x.source as NewsSource) || 'CoinDesk',
      publishedIso: x.published_at,
      url: x.url,
      badges: x.section ? [x.section] : undefined,
      tone: 'neutral',
      image_url: x.image_url,
      reading_time: x.reading_time,
    }))
    // Only use seed items when the wire is empty/unavailable.
    if (fromRSS.length > 0) return fromRSS.sort((a, b) => b.publishedIso.localeCompare(a.publishedIso))
    return [...NEWS_SEED].sort((a, b) => b.publishedIso.localeCompare(a.publishedIso))
  }, [wire])

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-[340px_1fr_340px] lg:gap-8">
      {/* Left: News widget */}
      <aside className="order-2 lg:order-1 lg:border-r lg:border-white/10 lg:pr-6">
        <div className="space-y-4">
          <NewsWidget items={newsItems} />
        </div>
      </aside>

      {/* Center: hero story */}
      <section className="order-1 lg:order-2 lg:px-6">
        {hero ? (
          <>
            <div className="mono text-[11px] font-semibold tracking-widest text-[rgb(var(--c-accent))]">
              {hero.kind === 'mx' ? hero.category.toUpperCase() : (hero.section || 'NEWS').toUpperCase()}
            </div>
            {hero.kind === 'mx' ? (
              <Link
                to={hero.href}
                className="group block rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,232,164,0.35)]"
              >
                <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-[18px] border border-white/10 bg-black">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,232,164,0.16),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.01))]" />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent" />
                  <div className="absolute left-4 bottom-4 mono text-[11px] font-semibold text-white/65">
                    Mock image
                  </div>
                </div>

                <h1 className="headline mt-5 text-[30px] font-semibold leading-tight text-white group-hover:underline md:text-[42px]">
                  {hero.title}
                </h1>
                <div className="mt-3 max-w-[780px] text-[16px] leading-relaxed text-white/65">{hero.dek}</div>
                <div className="mono mt-4 text-[11px] text-white/55">
                  {hero.author} • {timeAgo(hero.publishedIso)}
                </div>
              </Link>
            ) : (
              <a
                href={hero.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group block rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,232,164,0.35)]"
              >
                <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-[18px] border border-white/10 bg-black">
                  {hero.image_url ? (
                    <img
                      src={hero.image_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,232,164,0.16),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.01))]" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent" />
                  <div className="absolute left-4 bottom-4 mono text-[11px] font-semibold text-white/65">
                    Source: {hero.source}
                  </div>
                </div>

                <h1 className="headline mt-5 text-[30px] font-semibold leading-tight text-white group-hover:underline md:text-[42px]">
                  {hero.title}
                </h1>
                {hero.summary && (
                  <div className="mt-3 max-w-[780px] text-[16px] leading-relaxed text-white/65">{hero.summary}</div>
                )}
                <div className="mono mt-4 text-[11px] text-white/55">
                  {timeAgo(hero.publishedIso)}
                  {hero.author ? ` • ${hero.author}` : ''}
                </div>
              </a>
            )}
          </>
        ) : (
          <div className="mono text-[12px] text-white/55">Loading…</div>
        )}
      </section>

      {/* Right: top stories */}
      <aside className="order-3 lg:border-l lg:border-white/10 lg:pl-6">
        <div className="space-y-4">
          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-semibold text-white/90">Top</div>
                <div className="mono text-[11px] font-semibold tracking-widest text-white/35">STORIES</div>
              </div>
              <div className="mono text-[11px] text-white/45">{top[0] ? `Updated ${timeAgo(top[0].publishedIso)}` : ''}</div>
            </div>

            <div className="divide-y divide-white/10">
              {top.map((s, idx) => {
                const row = (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="headline line-clamp-2 text-[16px] font-semibold leading-snug text-white/92 group-hover:underline">
                        {s.title}
                      </div>
                      <div className="mono mt-2 text-[11px] text-white/55">{timeAgo(s.publishedIso)}</div>
                    </div>
                    <div className="mono shrink-0 text-[11px] font-semibold tracking-widest text-white/35">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>
                )

                return s.kind === 'mx' ? (
                  <Link
                    key={s.id}
                    to={s.href}
                    className="group block px-4 py-3 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,232,164,0.35)]"
                  >
                    {row}
                  </Link>
                ) : (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="group block px-4 py-3 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,232,164,0.35)]"
                  >
                    {row}
                  </a>
                )
              })}
            </div>
          </section>

          <section className="panel p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold text-white/90">Exchanges</div>
                <div className="mono mt-1 text-[11px] text-white/50">Affiliate links, clean list, no clutter.</div>
              </div>
              <Link
                to="/exchanges"
                className="mono shrink-0 rounded-full border border-white/10 bg-white/0 px-3 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,232,164,0.35)]"
              >
                View
              </Link>
            </div>
          </section>

          {/* Token Unlocks Section */}
          <UnlocksWidget />
        </div>
      </aside>
    </div>
  )
}
