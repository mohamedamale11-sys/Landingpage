import { Link } from 'react-router-dom'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(8,10,12,0.82)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1280px] px-4 py-3.5 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-baseline gap-2 rounded-[12px] px-2 py-1 -ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,232,164,0.35)]"
          >
            <div className="headline text-[20px] font-semibold text-white md:text-[22px]">MxCrypto</div>
            <div className="mono hidden text-[11px] font-semibold tracking-widest text-white/55 sm:block">NEWS</div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/exchanges"
              className="mono rounded-full border border-white/10 bg-white/0 px-3 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,232,164,0.35)]"
            >
              Exchanges
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
