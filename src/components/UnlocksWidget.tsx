import { useEffect, useState } from 'react'

export type TokenUnlock = {
    rank: string
    name: string
    symbol: string
    logo_url: string
    price: string
    price_change_24h: string
    market_cap: string
    circulating_supply: string
    unlock_progress: string
    next_unlock_amount: string
    next_unlock_usd: string
    unlock_percent: string
    unlock_date: string
    days_until: number
    url: string
    scraped_at: string
}

export function useUnlocks() {
    const [unlocks, setUnlocks] = useState<TokenUnlock[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const ac = new AbortController()
        fetch('/api/unlocks?limit=5', { signal: ac.signal })
            .then((r) => r.json())
            .then((data) => {
                if (data.ok && data.items) {
                    setUnlocks(data.items)
                }
                setLoading(false)
            })
            .catch((e) => {
                if (e.name !== 'AbortError') {
                    setError(e.message)
                    setLoading(false)
                }
            })
        return () => ac.abort()
    }, [])

    return { unlocks, loading, error }
}

function ProgressBar({ progress }: { progress: string }) {
    const pct = parseFloat(progress) || 0
    return (
        <div className="h-1.5 w-full rounded-full bg-white/10">
            <div
                className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--c-accent))] to-[rgba(0,232,164,0.6)]"
                style={{ width: `${Math.min(pct, 100)}%` }}
            />
        </div>
    )
}

export function UnlocksWidget() {
    const { unlocks, loading, error } = useUnlocks()

    if (loading) {
        return (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.02] p-5">
                <div className="mono mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-white/50">
                    <span>Token Unlocks</span>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[rgb(var(--c-accent))]"></div>
                </div>
            </div>
        )
    }

    if (error || unlocks.length === 0) {
        return (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.02] p-5">
                <div className="mono mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-white/50">
                    <span>Token Unlocks</span>
                </div>
                <p className="text-center text-[13px] text-white/40">No unlock events available</p>
            </div>
        )
    }

    return (
        <div className="rounded-[20px] border border-white/10 bg-white/[0.02] p-5">
            {/* Header */}
            <div className="mono mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest">
                <span className="text-white/50">Upcoming Unlocks</span>
                <span className="text-[rgb(var(--c-accent))]">Live</span>
            </div>

            {/* Unlock list */}
            <div className="space-y-3">
                {unlocks.map((u) => (
                    <a
                        key={u.symbol}
                        href={u.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-[12px] border border-white/5 bg-white/[0.02] p-3 transition hover:border-white/15 hover:bg-white/[0.04]"
                    >
                        {/* Top row: coin info + countdown */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                {u.logo_url ? (
                                    <img
                                        src={u.logo_url}
                                        alt={u.symbol}
                                        className="h-7 w-7 rounded-full"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/70">
                                        {u.symbol.slice(0, 2)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[13px] font-semibold text-white truncate">{u.name}</span>
                                        <span className="mono text-[10px] text-white/40">{u.symbol}</span>
                                    </div>
                                    <div className="text-[11px] text-white/50">{u.price}</div>
                                </div>
                            </div>

                            {/* Countdown */}
                            <div className="mono shrink-0 rounded-full border border-[rgba(0,232,164,0.2)] bg-[rgba(0,232,164,0.08)] px-2.5 py-1 text-[10px] font-semibold text-[rgb(var(--c-accent))]">
                                {u.unlock_date}
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-[10px]">
                                <span className="text-white/40">Unlock Progress</span>
                                <span className="mono text-white/60">{u.unlock_progress}</span>
                            </div>
                            <ProgressBar progress={u.unlock_progress} />
                        </div>

                        {/* Unlock amount info */}
                        <div className="mt-2.5 flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                            <div>
                                <div className="text-[10px] text-white/40">Next Unlock</div>
                                <div className="mono text-[12px] font-semibold text-white/90">{u.next_unlock_amount}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-white/40">Value</div>
                                <div className="mono text-[12px] font-semibold text-[rgb(var(--c-accent))]">{u.next_unlock_usd}</div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Footer link */}
            <a
                href="https://coinmarketcap.com/token-unlocks/"
                target="_blank"
                rel="noopener noreferrer"
                className="mono mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/40 hover:text-white/60"
            >
                View all on CoinMarketCap ↗
            </a>
        </div>
    )
}
