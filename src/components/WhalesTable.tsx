import { Coins, RefreshCw, Filter, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WhaleHoldingRow } from '../lib/api'

interface WhalesTableProps {
  rows: WhaleHoldingRow[]
  isLoading: boolean
  error: string
  windowHours: number
  onWindowChange: (hours: number) => void
  onRefresh: () => void
}

const WINDOW_OPTIONS = [
  { label: '24H', hours: 24 },
  { label: '3 Days', hours: 72 },
  { label: '7 Days', hours: 168 },
]

const STABLES = new Set(['USDC', 'USDT', 'DAI', 'PYUSD', 'USDE'])
const MAJORS = new Set(['SOL', 'ETH', 'BTC', 'WETH', 'WBTC'])

function formatCompactUSD(value: number | null) {
  if (!value || value <= 0) return '—'
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function formatSOL(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)}K`
  if (abs >= 1) return abs.toFixed(1)
  return abs.toFixed(2)
}

function ChainPill() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-[#111827] text-[10px] font-bold text-[#14F195]">
      S
    </span>
  )
}

export function WhalesTable(props: WhalesTableProps) {
  const [excludeStable, setExcludeStable] = useState(true)
  const [excludeMajors, setExcludeMajors] = useState(false)
  const [smallCapOnly, setSmallCapOnly] = useState(false)

  const filteredRows = useMemo(() => {
    let next = [...props.rows]
    if (excludeStable) next = next.filter((row) => !STABLES.has(row.symbol.toUpperCase()))
    if (excludeMajors) next = next.filter((row) => !MAJORS.has(row.symbol.toUpperCase()))
    if (smallCapOnly) {
      next = next.filter((row) => row.marketCapUsd == null || (row.marketCapUsd >= 1_000_000 && row.marketCapUsd <= 50_000_000))
    }
    return next
  }, [props.rows, excludeStable, excludeMajors, smallCapOnly])

  const maxBuy = useMemo(() => {
    if (filteredRows.length === 0) return 1
    return Math.max(...filteredRows.map((row) => row.buySOL), 1)
  }, [filteredRows])

  const resetFilters = () => {
    setExcludeStable(true)
    setExcludeMajors(false)
    setSmallCapOnly(false)
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-8 lg:px-8">
      <div className="rounded-3xl border border-white/5 bg-[#080d17]/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />

        <div className="border-b border-white/5 px-6 py-5 relative z-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-[26px] font-bold tracking-tight text-white flex items-center gap-2">
                What Smart Money Is Buying
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/10 bg-[#0a111e]/80 p-1 shadow-inner backdrop-blur-md">
                {WINDOW_OPTIONS.map((option) => {
                  const active = option.hours === props.windowHours
                  return (
                    <button
                      key={option.hours}
                      type="button"
                      onClick={() => props.onWindowChange(option.hours)}
                      className={[
                        'relative rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors duration-300 outline-none',
                        active ? 'text-white' : 'text-white/40 hover:text-white/80',
                      ].join(' ')}
                    >
                      {active && (
                        <motion.div
                          layoutId="whale-window-active"
                          className="absolute inset-0 rounded-xl bg-white/10 border border-white/5 shadow-sm"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{option.label}</span>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={props.onRefresh}
                className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[13px] font-semibold text-white/70 transition-all duration-300 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_4px_15px_rgba(255,255,255,0.05)] active:scale-95"
              >
                <RefreshCw size={15} className={`transition-transform duration-500 group-hover:rotate-180 ${props.isLoading ? 'animate-spin' : ''}`} />
                {props.isLoading ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 mr-2 text-[12px] font-bold uppercase tracking-wider text-white/30">
                <Filter size={14} /> Filters
              </div>
              <button
                type="button"
                onClick={() => setSmallCapOnly((v) => !v)}
                className={[
                  'rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all duration-300',
                  smallCapOnly ? 'border-brand-500/40 bg-brand-500/10 text-brand-400 shadow-[0_0_10px_rgba(27,231,95,0.1)]' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
                ].join(' ')}
              >
                Small Caps (1M-50M)
              </button>

              <button
                type="button"
                onClick={() => setExcludeStable((v) => !v)}
                className={[
                  'rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all duration-300',
                  excludeStable ? 'border-brand-500/40 bg-brand-500/10 text-brand-400 shadow-[0_0_10px_rgba(27,231,95,0.1)]' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
                ].join(' ')}
              >
                No Stables
              </button>

              <button
                type="button"
                onClick={() => setExcludeMajors((v) => !v)}
                className={[
                  'rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all duration-300',
                  excludeMajors ? 'border-brand-500/40 bg-brand-500/10 text-brand-400 shadow-[0_0_10px_rgba(27,231,95,0.1)]' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
                ].join(' ')}
              >
                No L1/L2 Majors
              </button>

              {(excludeStable || excludeMajors || smallCapOnly) && (
                <button type="button" onClick={resetFilters} className="flex items-center justify-center h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="text-[12px] font-semibold text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">{filteredRows.length} tokens matching</div>
          </div>
        </div>

        {props.error ? <div className="border-b border-rose-500/20 bg-rose-500/10 px-5 py-3 text-sm text-rose-300">{props.error}</div> : null}

        <div className="overflow-x-auto relative z-10">
          <table className="w-full min-w-[980px] text-left border-collapse">
            <thead className="bg-[#050912]/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-widest text-white/40 sticky top-0 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Chain</th>
                <th className="px-6 py-4">Token</th>
                <th className="px-6 py-4 text-right">Buy SOL</th>
                <th className="px-6 py-4 text-right">Net Flow (24H)</th>
                <th className="px-6 py-4 text-right">Trades</th>
                <th className="px-6 py-4 text-right">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-[13px] text-white/90">
              <AnimatePresence>
                {filteredRows.map((row) => {
                  const isPositive = row.netSOL >= 0
                  const balanceBar = Math.max(4, Math.round((row.buySOL / maxBuy) * 100))
                  return (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      key={`${row.mint}-${row.flowSide}`}
                      className="group hover:bg-white/[0.02] transition-colors duration-300"
                    >
                      <td className="px-6 py-4"><ChainPill /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.imageUrl ? (
                            <img src={row.imageUrl} alt={row.symbol} className="h-8 w-8 rounded-full border border-white/10 bg-[#0c1322] shadow-lg group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0c1322] shadow-lg group-hover:scale-110 transition-transform duration-300 text-[12px] font-bold text-white/80">{row.symbol.charAt(0)}</div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-[14px] font-bold text-white tracking-tight">{row.symbol}</div>
                            <div className="truncate text-[12px] font-medium text-white/40">{row.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex min-w-[155px] items-center justify-end gap-3">
                          <span className="font-mono text-[14px] font-medium text-white">{formatSOL(row.buySOL)}</span>
                          <span className="h-2 w-20 overflow-hidden rounded-full bg-white/5 shadow-inner">
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: `${balanceBar}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="block h-full rounded-full bg-gradient-to-r from-teal-400 to-[#2dd4bf] shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                            />
                          </span>
                        </div>
                      </td>
                      <td className={[
                        'px-6 py-4 text-right font-mono text-[14px] font-bold tracking-tight',
                        isPositive ? 'text-brand-400 drop-shadow-[0_0_8px_rgba(27,231,95,0.4)]' : 'text-rose-400',
                      ].join(' ')}>
                        {isPositive ? '+' : '-'}{formatSOL(row.netSOL)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-[14px] font-medium text-white/60">{row.tradeCount}</td>
                      <td className="px-6 py-4 text-right font-mono text-[14px] font-medium text-white/60">{formatCompactUSD(row.marketCapUsd)}</td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>

              {!props.isLoading && filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm text-white/50">
                    No smart-money token rows in this window.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-xs text-white/45">
          <span>Live backend data</span>
          <span className="inline-flex items-center gap-1"><Coins size={12} /> MxCrypto Intelligence</span>
        </div>
      </div>
    </div>
  )
}
