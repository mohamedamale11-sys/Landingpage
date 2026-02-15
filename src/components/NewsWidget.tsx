import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'
import { timeAgo } from '../lib/time'
import type { NewsItem, NewsSource } from '../data/news_mvp'

function sourceMark(s: NewsSource) {
  switch (s) {
    case 'CoinDesk':
      return { bg: 'bg-[rgba(56,189,248,0.16)]', fg: 'text-[rgba(56,189,248,0.95)]', txt: 'CD' }
    case 'The Block':
      return { bg: 'bg-[rgba(255,255,255,0.10)]', fg: 'text-white/85', txt: 'TB' }
    case 'Decrypt':
      return { bg: 'bg-[rgba(0,232,164,0.14)]', fg: 'text-[rgba(0,232,164,0.95)]', txt: 'DC' }
    case 'DL News':
      return { bg: 'bg-[rgba(244,63,94,0.14)]', fg: 'text-[rgba(244,63,94,0.95)]', txt: 'DL' }
    case 'Unchained':
      return { bg: 'bg-[rgba(245,158,11,0.14)]', fg: 'text-[rgba(245,158,11,0.95)]', txt: 'UC' }
    case 'CoinTelegraph':
      return { bg: 'bg-[rgba(124,58,237,0.16)]', fg: 'text-[rgba(167,139,250,0.95)]', txt: 'CT' }
  }
}

function TonePill(props: { tone?: NewsItem['tone']; badges?: string[] }) {
  const isSponsored = props.tone === 'sponsored' || (props.badges ?? []).some((b) => b.toLowerCase() === 'sponsored')
  if (isSponsored) {
    return (
      <span className="mono rounded-full border border-[rgba(245,158,11,0.28)] bg-[rgba(245,158,11,0.10)] px-2 py-[3px] text-[10px] font-semibold text-[rgba(245,158,11,0.95)]">
        AD
      </span>
    )
  }
  if (props.tone === 'hot') {
    return (
      <span className="mono rounded-full border border-[rgba(244,63,94,0.28)] bg-[rgba(244,63,94,0.10)] px-2 py-[3px] text-[10px] font-semibold text-[rgba(244,63,94,0.95)]">
        HOT
      </span>
    )
  }
  return null
}

export function NewsWidget(props: { items: NewsItem[] }) {
  const items = useMemo(
    () => props.items.slice().sort((a, b) => b.publishedIso.localeCompare(a.publishedIso)),
    [props.items],
  )
  const updatedIso = items[0]?.publishedIso ?? null

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-semibold text-white/90">Latest</div>
            <span className="mono text-[11px] font-semibold text-white/35">NEWS</span>
          </div>
          <div className="mono mt-1 text-[11px] text-white/45">
            {items.length > 0 ? `${items.length} stories` : 'Loading…'}
            {updatedIso ? ` • Updated ${timeAgo(updatedIso)}` : ''}
          </div>
        </div>
        <a
          href="https://www.coindesk.com/arc/outboundfeeds/rss?outputType=xml"
          target="_blank"
          rel="noopener noreferrer"
          className="mono shrink-0 rounded-full border border-white/10 bg-white/0 px-3 py-2 text-[11px] font-semibold text-white/60 hover:bg-white/5 hover:text-white"
          title="RSS source"
        >
          RSS ↗
        </a>
      </div>

      <div className="mx-scroll max-h-[460px] overflow-y-auto lg:max-h-[680px]">
        <div className="divide-y divide-white/10">
          {items.map((n) => {
            const mark = sourceMark(n.source)
            const badges = (n.badges ?? []).slice(0, 1)
            return (
              <Link
                key={n.id}
                to={`/news?u=${encodeURIComponent(n.url)}`}
                className={cn(
                  'group block px-4 py-3 transition',
                  'hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 text-[13px] font-semibold leading-snug text-white/92">
                        <span className="line-clamp-2">{n.title}</span>
                      </div>
                      <div className="hidden sm:block">
                        <TonePill tone={n.tone} badges={n.badges} />
                      </div>
                    </div>

                    <div className="mono mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
                      <span className="text-white/60">{timeAgo(n.publishedIso)}</span>
                      <span className="text-white/25">•</span>
                      <span>{n.source}</span>
                      {badges.map((b) => (
                        <span
                          key={b}
                          className="mono rounded-full border border-white/10 bg-white/5 px-2 py-[3px] text-[10px] font-semibold text-white/65"
                        >
                          {b}
                        </span>
                      ))}
                      {n.reading_time && (
                        <span className="mono text-[10px] text-white/40">
                          {n.reading_time}
                        </span>
                      )}
                      <span className="sm:hidden">
                        <TonePill tone={n.tone} badges={n.badges} />
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'mono grid h-8 w-8 shrink-0 place-items-center rounded-[12px] border border-white/10 text-[11px] font-semibold',
                      mark.bg,
                      mark.fg,
                      'opacity-80 group-hover:opacity-100',
                    )}
                    title={n.source}
                  >
                    {mark.txt}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
