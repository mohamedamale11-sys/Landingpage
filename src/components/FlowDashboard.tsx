import { Activity, RefreshCw, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import type { FlowListItem, FlowMetrics } from '../lib/flow'

interface FlowDashboardProps {
  windowHours: number
  isLoading: boolean
  error: string
  inflow?: FlowListItem[]
  outflow?: FlowListItem[]
  metrics?: FlowMetrics
  updatedAt?: number
  onRefresh: () => void
  onWindowChange: (hours: number) => void
}

const WINDOW_OPTIONS = [
  { label: '24H', hours: 24 },
  { label: '3 Days', hours: 72 },
  { label: '7 Days', hours: 168 },
]

const CHART_HEIGHT = 240

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.round(value)))
}

function formatSOL(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)}K SOL`
  if (abs >= 1) return `${abs.toFixed(1)} SOL`
  return `${abs.toFixed(2)} SOL`
}

function formatUpdatedAt(ts?: number) {
  if (!ts) return 'No updates yet'
  const deltaMs = Date.now() - ts
  if (deltaMs < 60_000) return 'Updated just now'
  if (deltaMs < 3_600_000) return `Updated ${Math.max(1, Math.floor(deltaMs / 60_000))}m ago`
  return `Updated ${Math.max(1, Math.floor(deltaMs / 3_600_000))}h ago`
}

function chartMax(items: FlowListItem[]) {
  if (items.length === 0) return 1
  return Math.max(...items.map((item) => Math.abs(item.valueSOL)), 1)
}

function ChartCard(props: { title: string; tone: 'buy' | 'sell'; items: FlowListItem[] }) {
  const maxValue = chartMax(props.items)
  const isBuy = props.tone === 'buy'
  const barColor = isBuy ? '#2dd4bf' : '#f87171'
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-white/5 bg-[#0c1118]/80 p-6 backdrop-blur-xl relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -mr-16 -mt-16 transition-colors duration-700 ${isBuy ? 'bg-teal-500/5 group-hover:bg-teal-500/10' : 'bg-rose-500/5 group-hover:bg-rose-500/10'}`} />

      <div className="mb-6 flex items-center justify-between relative z-10">
        <h3 className="flex items-center gap-2 text-[17px] font-semibold text-white">
          {isBuy ? <TrendingUp size={18} className="text-[#2dd4bf]" /> : <TrendingDown size={18} className="text-[#f87171]" />}
          {props.title}
        </h3>
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-0.5 rounded">SOL volume</span>
      </div>

      {props.items.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/40">
          No data in this window.
        </div>
      ) : (
        <div className="relative z-10" style={{ height: CHART_HEIGHT + 42 }}>
          <div className="absolute left-0 top-0" style={{ width: 58, height: CHART_HEIGHT }}>
            {yTicks.map((tick) => (
              <div
                key={tick}
                className="absolute right-2"
                style={{ bottom: `${tick * CHART_HEIGHT}px`, transform: 'translateY(50%)' }}
              >
                <span className="text-[10px] font-medium text-white/30">{formatSOL(maxValue * tick)}</span>
              </div>
            ))}
          </div>

          <div className="absolute right-0 top-0" style={{ left: 62, height: CHART_HEIGHT }}>
            {yTicks.map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 border-t border-dashed border-white/5"
                style={{ bottom: `${tick * CHART_HEIGHT}px` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end gap-2 px-1">
              {props.items.map((item, idx) => {
                const height = Math.max(4, (Math.abs(item.valueSOL) / maxValue) * CHART_HEIGHT)
                return (
                  <div key={`${item.title}-${item.subtitle}`} className="group/bar relative flex min-w-0 flex-1 flex-col items-center justify-end h-full">
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#070a10]/95 backdrop-blur-md px-3 py-1.5 text-[11px] text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover/bar:opacity-100">
                      <div className="font-semibold">{item.title}</div>
                      <div style={{ color: barColor }} className="mt-0.5">{formatSOL(item.valueSOL)}</div>
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ duration: 0.7, delay: idx * 0.05, type: 'spring', bounce: 0.2 }}
                      className="w-full rounded-t flex flex-col justify-end overflow-hidden"
                      style={{
                        backgroundColor: barColor,
                        boxShadow: `0 -4px 15px ${barColor}25`
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-black/40 to-transparent mix-blend-overlay" />
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="absolute right-0" style={{ left: 62, top: CHART_HEIGHT + 12 }}>
            <div className="flex gap-2 px-1">
              {props.items.map((item) => (
                <div key={`label-${item.title}-${item.subtitle}`} className="flex min-w-0 flex-1 justify-center overflow-hidden">
                  <span className="truncate text-[11px] font-medium text-white/50">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function MetricCard(props: { label: string; value: string; icon: ComponentType<{ size?: number; className?: string }> }) {
  const Icon = props.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-white/5 bg-[#0c1118]/80 backdrop-blur-md p-6 transition-all duration-300 hover:border-white/10 hover:bg-[#0e141f]/90 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[12px] font-bold uppercase tracking-widest text-white/35 group-hover:text-white/50 transition-colors">{props.label}</span>
        <div className="p-2 rounded-xl bg-white/5 text-white/40 group-hover:text-white/80 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
          <Icon size={16} />
        </div>
      </div>
      <div className="text-[28px] font-bold tracking-tight text-white relative z-10">{props.value}</div>
    </motion.div>
  )
}

export function FlowDashboard(props: FlowDashboardProps) {
  const inflow = props.inflow ?? []
  const outflow = props.outflow ?? []
  const metrics = props.metrics ?? { totalTrades: 0, uniqueWallets: 0, activeWallets: 0 }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-white">Top Tokens</h2>
          <p className="mt-1 text-[14px] text-white/55">
            Real smart money inflow and outflow from backend data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-[#0d1118]/80 backdrop-blur p-1 shadow-inner">
            {WINDOW_OPTIONS.map((option) => {
              const active = option.hours === props.windowHours
              return (
                <button
                  key={option.hours}
                  type="button"
                  onClick={() => props.onWindowChange(option.hours)}
                  className={[
                    'relative rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors duration-300 outline-none',
                    active
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80',
                  ].join(' ')}
                >
                  {active && (
                    <motion.div
                      layoutId="flow-window-active"
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total trades" value={formatCount(metrics.totalTrades)} icon={Activity} />
        <MetricCard label="Unique wallets" value={formatCount(metrics.uniqueWallets)} icon={Users} />
        <MetricCard label="Active wallets" value={formatCount(metrics.activeWallets)} icon={Wallet} />
        <MetricCard label="Status" value={formatUpdatedAt(props.updatedAt).replace('Updated ', '')} icon={RefreshCw} />
      </div>

      {props.error ? (
        <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {props.error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Most bought" tone="buy" items={inflow} />
        <ChartCard title="Most sold" tone="sell" items={outflow} />
      </div>
    </section>
  )
}
