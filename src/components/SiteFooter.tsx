import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-transparent">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="headline text-[18px] font-semibold text-white">
            MxCrypto
          </Link>
          <div className="mono text-[11px] text-white/55">{new Date().getFullYear()} • MVP feed UI • Mock data</div>
        </div>
      </div>
    </footer>
  )
}
