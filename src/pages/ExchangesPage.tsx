import { EXCHANGES } from '../data/exchanges'

export function ExchangesPage() {
  return (
    <div className="mx-auto max-w-[980px]">
      <div className="mono text-[11px] font-semibold tracking-widest text-[rgb(var(--c-accent))]">EXCHANGES</div>
      <h1 className="headline mt-2 text-[34px] font-semibold leading-tight text-white md:text-[44px]">
        Affiliate Links
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-white/65">
        We may earn a commission if you sign up or trade via these links. Replace the URLs with your real affiliate
        tracking links.
      </p>

      <div className="panel mt-6 overflow-hidden">
        <div className="divide-y divide-white/10">
          {EXCHANGES.map((x) => (
            <a
              key={x.id}
              href={x.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="group block px-4 py-5 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,232,164,0.35)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="headline text-[20px] font-semibold text-white/92 group-hover:text-white group-hover:underline">
                      {x.name}
                    </div>
                    {x.badge && (
                      <span className="mono rounded-full border border-white/10 bg-white/5 px-2 py-[3px] text-[10px] font-semibold text-white/70">
                        {x.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-[14px] leading-relaxed text-white/65">{x.blurb}</div>
                </div>
                <span className="mono shrink-0 rounded-full border border-white/10 bg-white/0 px-3 py-2 text-[11px] font-semibold text-white/80 transition group-hover:bg-white/5">
                  {x.cta}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 text-[13px] leading-relaxed text-white/55">
        Disclaimer: Trading crypto involves risk. This page is informational and does not constitute financial advice.
      </div>
    </div>
  )
}
