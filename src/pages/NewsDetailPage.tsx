import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchNewsItemByURL, type WireItem } from '../data/latest'
import { timeAgo } from '../lib/time'

function sourceLabel(src: string) {
  if (src === 'CoinTelegraph') return 'CoinTelegraph'
  if (src === 'CoinDesk') return 'CoinDesk'
  return src || 'Source'
}

export function NewsDetailPage() {
  const [params] = useSearchParams()
  const rawURL = params.get('u') || ''
  const missingURL = !rawURL

  const [item, setItem] = useState<WireItem | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!rawURL) return
    const ac = new AbortController()
    fetchNewsItemByURL(rawURL, ac.signal)
      .then((x) => {
        setItem(x)
        setErr(null)
      })
      .catch((e) => {
        setItem(null)
        setErr(e instanceof Error ? e.message : 'Failed to load story.')
      })
    return () => ac.abort()
  }, [rawURL])

  const publishedIso = item?.published_at ?? null
  const source = useMemo(() => sourceLabel(item?.source ?? ''), [item?.source])

  // Split content into readable paragraphs
  const paragraphs = useMemo(() => {
    if (!item?.content) return []

    let content = item.content

    // Preprocessing: Add space after periods followed by capital letters (fixes merged sentences)
    // Match: period not preceded by common abbreviations, followed immediately by capital letter
    content = content.replace(/\.(?=[A-Z][a-z])/g, '. ')
    content = content.replace(/\?(?=[A-Z])/g, '? ')
    content = content.replace(/!(?=[A-Z])/g, '! ')
    // Fix merged quotes
    content = content.replace(/"(?=[A-Z])/g, '" ')

    // If content has natural newlines, use those
    if (content.includes('\n\n')) {
      return content.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0)
    }

    // Otherwise, try to create logical breaks by grouping sentences
    let text = content

    // First, identify likely paragraph breaks (longer content sections)
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 0)

    // Group sentences into paragraphs (roughly 2-4 sentences each)
    const result: string[] = []
    let currentParagraph: string[] = []
    let charCount = 0

    for (const sentence of sentences) {
      currentParagraph.push(sentence)
      charCount += sentence.length

      // Create a new paragraph every ~400 chars or 3-4 sentences
      if (charCount > 400 || currentParagraph.length >= 4) {
        result.push(currentParagraph.join(' '))
        currentParagraph = []
        charCount = 0
      }
    }

    // Add remaining sentences
    if (currentParagraph.length > 0) {
      result.push(currentParagraph.join(' '))
    }

    return result.length > 0 ? result : [content]
  }, [item?.content])

  return (
    <div className="mx-auto max-w-[900px]">
      <article>
        {/* Category badge */}
        <div className="mono text-[11px] font-semibold tracking-widest text-[rgb(var(--c-accent))]">
          {item?.section ? item.section.toUpperCase() : 'NEWS'}
        </div>

        {err ? (
          <>
            <h1 className="headline mt-2 text-[30px] font-semibold leading-tight text-white md:text-[40px]">
              Story unavailable
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-white/65">{err}</p>
            <Link
              to="/"
              className="mono mt-6 inline-flex rounded-full border border-white/10 bg-white/0 px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/5 hover:text-white"
            >
              ← Back to feed
            </Link>
          </>
        ) : missingURL ? (
          <>
            <h1 className="headline mt-2 text-[30px] font-semibold leading-tight text-white md:text-[40px]">
              Story unavailable
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-white/65">Missing story URL.</p>
            <Link
              to="/"
              className="mono mt-6 inline-flex rounded-full border border-white/10 bg-white/0 px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/5 hover:text-white"
            >
              ← Back to feed
            </Link>
          </>
        ) : item ? (
          <>
            {/* Title */}
            <h1 className="headline mt-3 text-[32px] font-semibold leading-tight text-white md:text-[48px]">
              {item.title}
            </h1>

            {/* Meta info */}
            <div className="mono mt-5 flex flex-wrap items-center gap-3 text-[12px] text-white/55">
              <span className="rounded-full bg-[rgba(56,189,248,0.12)] px-3 py-1 font-semibold text-[rgba(56,189,248,0.95)]">
                {source}
              </span>
              {item.author && (
                <>
                  <span className="text-white/25">•</span>
                  <span className="text-white/70">{item.author}</span>
                </>
              )}
              {publishedIso && (
                <>
                  <span className="text-white/25">•</span>
                  <span>{timeAgo(publishedIso)}</span>
                </>
              )}
              {item.reading_time && (
                <>
                  <span className="text-white/25">•</span>
                  <span className="text-white/50">{item.reading_time}</span>
                </>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="mono rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Hero Image */}
            {item.image_url ? (
              <div className="mt-8 overflow-hidden rounded-[20px] border border-white/10 bg-black shadow-2xl">
                <img
                  src={item.image_url}
                  alt=""
                  className="h-auto w-full object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[20px] border border-white/10 bg-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,232,164,0.14),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01))]" />
              </div>
            )}

            {/* Summary */}
            {item.summary && (
              <div className="mt-8 rounded-[16px] border-l-4 border-[rgb(var(--c-accent))] bg-white/[0.03] p-5">
                <p className="text-[17px] italic leading-relaxed text-white/80">
                  {item.summary}
                </p>
              </div>
            )}

            {/* Full Content */}
            <div className="mt-10 space-y-5">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-[17px] leading-[1.8] text-white/80"
                  >
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-[16px] leading-relaxed text-white/60">
                  No full content available. Visit the source for the complete article.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
              <a
                href={rawURL || (item?.url ?? '#')}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mono inline-flex items-center gap-2 rounded-full bg-[rgb(var(--c-accent))] px-5 py-3 text-[13px] font-semibold text-black transition hover:opacity-90"
              >
                Read on {source} ↗
              </a>
              <Link
                to="/"
                className="mono inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[13px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                ← Back to feed
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[rgb(var(--c-accent))]"></div>
            <span className="mono text-[13px] text-white/55">Loading article...</span>
          </div>
        )}
      </article>
    </div>
  )
}
