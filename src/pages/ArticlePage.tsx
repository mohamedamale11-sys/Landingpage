import { Link, useParams } from 'react-router-dom'
import { ARTICLES, getArticleBySlug } from '../data/articles'
import { cn } from '../lib/cn'
import { timeAgo } from '../lib/time'

function toneClass(t: 'gold' | 'slate' | 'ink' | 'sky') {
  switch (t) {
    case 'gold':
      return 'from-amber-200/70 via-white to-white'
    case 'sky':
      return 'from-sky-200/70 via-white to-white'
    case 'ink':
      return 'from-slate-200/80 via-white to-white'
    case 'slate':
      return 'from-stone-200/70 via-white to-white'
  }
}

export function ArticlePage() {
  const params = useParams()
  const slug = params.slug ?? ''
  const a = getArticleBySlug(slug)

  if (!a) {
    return (
      <div className="mx-auto max-w-[900px] py-10">
        <div className="headline text-[26px] font-semibold text-white">Article not found</div>
        <div className="mt-2 text-white/65">The URL may be wrong, or the story was removed.</div>
        <Link className="mono mt-6 inline-flex text-[12px] font-semibold text-white/75 hover:text-white" to="/">
          Back to home
        </Link>
      </div>
    )
  }

  const related = ARTICLES.filter((x) => x.id !== a.id && x.category === a.category).slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.8fr_1fr]">
      <article>
        <div className="mono text-[11px] font-semibold tracking-widest text-[rgb(var(--c-accent))]">
          {a.category.toUpperCase()}
        </div>
        <h1 className="headline mt-2 text-[34px] font-semibold leading-tight text-white md:text-[44px]">
          {a.title}
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-white/65">{a.dek}</p>

        <div className="mono mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
          <span className="font-semibold text-white/80">{a.author}</span>
          <span>•</span>
          <span>{timeAgo(a.publishedIso)}</span>
          <span>•</span>
          <span>{a.minutesToRead} min read</span>
        </div>

        <div
          className={cn(
            'mt-6 h-[280px] w-full rounded-[18px] border border-white/10 bg-gradient-to-br md:h-[360px]',
            toneClass(a.heroTone),
          )}
        />

        <div className="mt-8 max-w-none">
          {a.content.map((p) => (
            <p key={p} className="mt-4 text-[16px] leading-relaxed text-white/75">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {a.tags.map((t) => (
            <Link
              key={t}
              to="/"
              className="mono rounded-full border border-white/10 bg-white/5 px-3 py-[7px] text-[12px] font-semibold text-white/75 hover:bg-white/8 hover:text-white"
            >
              {t}
            </Link>
          ))}
        </div>
      </article>

      <aside className="lg:border-l lg:border-white/10 lg:pl-6">
        <div className="mono text-[11px] font-semibold tracking-widest text-[rgb(var(--c-accent))]">RELATED</div>
        <div className="mt-4 space-y-4">
          {related.map((r) => (
            <Link key={r.id} to={`/article/${r.slug}`} className="group block">
              <div className="headline line-clamp-2 text-[18px] font-semibold leading-snug text-white/92 group-hover:underline">
                {r.title}
              </div>
              <div className="mono mt-2 text-[11px] text-white/55">{timeAgo(r.publishedIso)}</div>
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="mono text-[11px] font-semibold tracking-widest text-white/45">MVP</div>
          <div className="mt-2 text-[14px] leading-relaxed text-white/65">
            Reading view only.
          </div>
        </div>
      </aside>
    </div>
  )
}
