import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Home, Menu, MessageSquare, Sparkles, TrendingUp, ArrowUp } from 'lucide-react'
import { motion } from 'framer-motion'

import { FlowDashboard } from './components/FlowDashboard'
import { SmartChat } from './components/SmartChat'
import { WhalesTable } from './components/WhalesTable'
import { createEmptyFlowSnapshot, type FlowSnapshot } from './lib/flow'
import { fetchLiveFlowData, fetchWhaleHoldings, type WhaleHoldingRow } from './lib/api'

type TabKey = 'home' | 'chat' | 'flows' | 'whales'

const SIDEBAR_TABS: Array<{ key: TabKey; label: string; icon: typeof Home }> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'chat', label: 'AI Chat', icon: MessageSquare },
  { key: 'flows', label: 'Inflow / Outflow', icon: TrendingUp },
  { key: 'whales', label: 'Whale Activity', icon: Activity },
]

const QUICK_PROMPTS = [
  'What memecoins are smart money buying right now?',
  'Show me top inflow tokens in the last 24 hours',
  'Which narrative is trending strongest today?',
  'Which Solana memecoin has the strongest outflow?',
]

function SideNav(props: {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  onPromptPick: (prompt: string) => void
}) {
  return (
    <aside className="mx-scroll hidden h-screen w-[260px] flex-col overflow-y-auto border-r border-white/5 bg-[#030914] text-sm lg:flex">
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="mb-1 mt-2 flex items-center gap-1 px-2">
          <div className="flex items-center tracking-[-0.04em] font-sans">
            <span className="text-[26px] font-extrabold text-brand-500 drop-shadow-[0_0_15px_rgba(27,231,95,0.5)]">Mx</span>
            <span className="text-[26px] font-semibold text-white">Crypto</span>
            <span className="ml-1.5 flex translate-y-[-2px] items-center justify-center rounded bg-brand-500 px-2 py-0.5 text-[12px] font-bold text-[#020710] shadow-[0_0_10px_rgba(27,231,95,0.4)]">
              AI
            </span>
          </div>
        </div>
        <div className="px-2 text-[13px] text-white/45">Solana memecoin analytics</div>
      </div>

      <nav className="flex-1 space-y-5 px-3">
        <div className="space-y-1">
          {SIDEBAR_TABS.map((item) => {
            const active = props.activeTab === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => props.onTabChange(item.key)}
                className={[
                  'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-300 outline-none',
                  active ? 'text-white' : 'text-white/50 hover:bg-white/[0.03] hover:text-white/90',
                ].join(' ')}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-lg bg-brand-500/10 border border-brand-500/20 shadow-[0_0_15px_rgba(27,231,95,0.05)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={16} className={`relative z-10 transition-colors duration-300 ${active ? 'text-brand-500 drop-shadow-[0_0_8px_rgba(27,231,95,0.5)]' : 'text-white/40 group-hover:text-white/70'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="border-t border-white/5 pt-4">
          <div className="mb-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">QUICK PROMPTS</div>
          <div className="space-y-1">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => props.onPromptPick(item)}
                className="line-clamp-2 w-full rounded-lg px-3 py-2 text-left text-[12px] text-white/45 transition hover:bg-white/5 hover:text-white/75"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/5 px-5 py-4 text-xs text-white/35">Powered by MxCrypto AI</div>
    </aside>
  )
}

function MobileBottomBar(props: {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  onAskAI: () => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#020710]/95 px-2 py-3 pb-6 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        <button type="button" onClick={() => props.onTabChange('home')} className={`flex flex-col items-center gap-1 p-2 ${props.activeTab === 'home' ? 'text-brand-500' : 'text-white/55'}`}>
          <Home size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button type="button" onClick={() => props.onTabChange('flows')} className={`flex flex-col items-center gap-1 p-2 ${props.activeTab === 'flows' ? 'text-brand-500' : 'text-white/55'}`}>
          <TrendingUp size={20} />
          <span className="text-[10px] font-medium">Flows</span>
        </button>
        <button type="button" onClick={() => props.onTabChange('whales')} className={`flex flex-col items-center gap-1 p-2 ${props.activeTab === 'whales' ? 'text-brand-500' : 'text-white/55'}`}>
          <Activity size={20} />
          <span className="text-[10px] font-medium">Whales</span>
        </button>
        <button type="button" onClick={props.onAskAI} className="flex flex-col items-center gap-1 p-2 text-brand-500">
          <Sparkles size={20} />
          <span className="text-[10px] font-semibold">Ask AI</span>
        </button>
      </div>
    </div>
  )
}

function HomePanel(props: { searchQuery: string; setSearchQuery: (v: string) => void; onSubmit: () => void; onPick: (q: string) => void; onTabNavigate: (tab: TabKey) => void }) {
  const suggestions = useMemo(() => QUICK_PROMPTS, [])

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pb-24 pt-12 lg:px-8 flex flex-col items-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full flex flex-col items-center mb-12 relative z-10"
      >
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-widest text-brand-500 uppercase border border-brand-500/20 shadow-[0_0_15px_rgba(27,231,95,0.1)]">
          Beta · Solana Smart Money
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-[54px] mb-4 text-center leading-[1.15]">
          Track the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600 drop-shadow-[0_0_20px_rgba(27,231,95,0.3)]">Smart Money</span>
        </h1>
        <p className="text-[15px] text-white/50 mb-8 text-center max-w-[560px] leading-relaxed">
          Gain unparalleled intelligence on Solana memecoin narratives. See what whales are buying and spot trends before they break.
        </p>

        <div className="w-full max-w-[760px] rounded-2xl border border-white/10 bg-[#060b13]/80 p-1.5 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-brand-500/50 focus-within:bg-[#060b13]/95 focus-within:shadow-[0_0_50px_rgba(27,231,95,0.15)] relative">
          <input
            type="text"
            value={props.searchQuery}
            onChange={(e) => props.setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && props.searchQuery.trim().length > 0) props.onSubmit() }}
            placeholder="Ask AI about memecoins, whales, or narrative flows..."
            className="w-full bg-transparent px-5 py-4 text-[16px] text-white outline-none placeholder:text-white/30"
          />
          <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 mt-1">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/40">
              <Sparkles size={14} className="text-brand-500" />
              Powered by MxCrypto AI
            </div>
            <button
              type="button"
              onClick={props.onSubmit}
              disabled={props.searchQuery.trim().length === 0}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${props.searchQuery.trim().length > 0
                ? 'bg-brand-500 text-[#020710] shadow-[0_0_20px_rgba(27,231,95,0.6)] hover:bg-brand-400 hover:scale-105'
                : 'bg-white/5 text-white/30'
                }`}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2.5 w-full max-w-[800px]">
          {suggestions.map((s, idx) => (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              key={s}
              type="button"
              onClick={() => props.onPick(s)}
              className="rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-[12px] font-medium text-white/60 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-400 backdrop-blur-md"
            >{s}</motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 gap-5 mt-4"
      >
        <div
          onClick={() => props.onTabNavigate('flows')}
          className="cursor-pointer col-span-1 rounded-3xl border border-white/5 bg-gradient-to-br from-[#0c1322]/80 to-[#040914]/80 p-7 relative overflow-hidden group transition-all duration-300 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-brand-500/15 transition-colors duration-700" />
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="p-2.5 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-500 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">Live Money Flow</h3>
          </div>
          <p className="text-[14px] text-white/50 mb-8 leading-relaxed relative z-10">View real-time capital rotation across Solana ecosystems. Identify where the smart money is moving before it hits the mainstream.</p>
          <div className="flex items-end justify-between relative z-10">
            <div className="flex -space-x-3">
              <div className="w-9 h-9 rounded-full border-2 border-[#0c1322] bg-[#2dd4bf] flex items-center justify-center text-[9px] font-bold text-[#052e16] shadow-lg">BUY</div>
              <div className="w-9 h-9 rounded-full border-2 border-[#0c1322] bg-[#f87171] z-10 flex items-center justify-center text-[9px] font-bold text-[#450a0a] shadow-lg">SELL</div>
            </div>
            <div className="text-[13px] font-semibold text-brand-500 group-hover:text-brand-400 transition-colors flex items-center gap-1">Explore Flows <ArrowUp size={14} className="rotate-45" /></div>
          </div>
        </div>

        <div
          onClick={() => props.onTabNavigate('whales')}
          className="cursor-pointer col-span-1 rounded-3xl border border-white/5 bg-gradient-to-br from-[#0c1322]/80 to-[#040914]/80 p-7 relative overflow-hidden group transition-all duration-300 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-500/15 transition-colors duration-700" />
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Activity size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">Whale Activity</h3>
          </div>
          <p className="text-[14px] text-white/50 mb-8 leading-relaxed relative z-10">Follow highest-performing PnL wallets. See their exact SPL token entries and exits as they happen on-chain.</p>
          <div className="flex items-end justify-between relative z-10">
            <div className="text-[32px] font-extrabold text-white tracking-tighter leading-none">48+<span className="text-[13px] text-white/30 font-medium tracking-normal ml-2 relative -top-1">whales tracked</span></div>
            <div className="text-[13px] font-semibold text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-1">View Wallets <ArrowUp size={14} className="rotate-45" /></div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')
  const [windowHours, setWindowHours] = useState(24)
  const [flowSnapshot, setFlowSnapshot] = useState<FlowSnapshot | null>(null)
  const [flowLoading, setFlowLoading] = useState(false)
  const [flowError, setFlowError] = useState('')
  const [whaleRows, setWhaleRows] = useState<WhaleHoldingRow[]>([])
  const [whaleLoading, setWhaleLoading] = useState(false)
  const [whaleError, setWhaleError] = useState('')

  const flowCacheRef = useRef<Map<number, { snapshot: FlowSnapshot; ts: number }>>(new Map())
  const whaleCacheRef = useRef<Map<number, { rows: WhaleHoldingRow[]; ts: number }>>(new Map())

  const asErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message.trim().length > 0) return err.message
    return fallback
  }

  const openChatWithPrompt = (query: string) => {
    const q = query.trim()
    if (!q) return
    setInitialQuery(q)
    setChatOpen(true)
    setActiveTab('chat')
    setSearchQuery('')
  }

  const ensureFlowData = async (force = false) => {
    if (flowLoading) return
    const cached = flowCacheRef.current.get(windowHours)
    const now = Date.now()
    if (!force && cached && now - cached.ts < 4 * 60 * 1000) {
      setFlowSnapshot(cached.snapshot)
      return
    }
    setFlowLoading(true)
    setFlowError('')
    try {
      const snapshot = await fetchLiveFlowData(windowHours)
      flowCacheRef.current.set(windowHours, { snapshot, ts: Date.now() })
      setFlowSnapshot(snapshot)
      setFlowError('')
    } catch (err) {
      console.warn('[Flow] API failed:', err)
      setFlowError(asErrorMessage(err, 'Unable to load token flow data from backend.'))
      const fallback = createEmptyFlowSnapshot(windowHours)
      setFlowSnapshot(fallback)
    } finally {
      setFlowLoading(false)
    }
  }

  const ensureWhaleRows = async (force = false) => {
    if (whaleLoading) return
    const now = Date.now()
    const cached = whaleCacheRef.current.get(windowHours)
    if (!force && cached && now - cached.ts < 4 * 60 * 1000) {
      setWhaleRows(cached.rows)
      return
    }

    setWhaleLoading(true)
    setWhaleError('')
    try {
      const rows = await fetchWhaleHoldings(windowHours, 40)
      whaleCacheRef.current.set(windowHours, { rows, ts: Date.now() })
      setWhaleRows(rows)
    } catch (err) {
      console.warn('[Whales] API failed:', err)
      setWhaleRows([])
      setWhaleError(asErrorMessage(err, 'Unable to load smart-money holdings from backend.'))
    } finally {
      setWhaleLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'chat') setChatOpen(true)
    if (activeTab === 'flows') void ensureFlowData(false)
    if (activeTab === 'whales') void ensureWhaleRows(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, windowHours])

  return (
    <div className="flex min-h-screen bg-[#020710] pb-20 font-sans text-white selection:bg-brand-500/30 lg:pb-0">
      <SideNav activeTab={activeTab} onTabChange={setActiveTab} onPromptPick={openChatWithPrompt} />

      <button
        type="button"
        onClick={() => { setActiveTab('chat'); setChatOpen(true) }}
        className={`group fixed bottom-6 z-40 hidden items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3.5 text-[#020710] shadow-[0_8px_32px_rgba(27,231,95,0.3)] transition-all duration-300 hover:scale-105 hover:bg-brand-400 sm:flex ${chatOpen ? 'right-[520px]' : 'right-6'}`}
      >
        <Sparkles size={18} className="animate-pulse" />
        <span className="text-[15px] font-semibold tracking-wide">Ask AI</span>
      </button>

      <main className={`relative flex min-w-0 flex-1 flex-col bg-[#010408] transition-[padding] duration-300 ${chatOpen ? 'lg:pr-[500px]' : 'lg:pr-0'}`}>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/5 bg-[#020710]/80 px-4 backdrop-blur-md lg:px-6">
          <div className="flex h-full items-center gap-6">
            <button type="button" className="-ml-2 p-1.5 text-white/60 hover:text-white lg:hidden"><Menu size={20} /></button>
            <button type="button" onClick={() => setActiveTab('home')} className="text-[14px] font-medium tracking-wide text-brand-500">
              MxCrypto Terminal
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setActiveTab('chat'); setChatOpen(true) }}
            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <MessageSquare size={14} className="text-white/60" />
            Open Chat
          </button>
        </header>

        {activeTab === 'home' && (
          <HomePanel searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={() => openChatWithPrompt(searchQuery)} onPick={openChatWithPrompt} onTabNavigate={setActiveTab} />
        )}

        {activeTab === 'flows' && (
          <div className="mx-auto w-full max-w-[1160px] px-4 pb-24 pt-8 lg:px-8">
            <FlowDashboard
              windowHours={windowHours}
              isLoading={flowLoading}
              error={flowError}
              inflow={flowSnapshot?.inflow}
              outflow={flowSnapshot?.outflow}
              metrics={flowSnapshot?.metrics}
              updatedAt={flowSnapshot?.updatedAt}
              onRefresh={() => void ensureFlowData(true)}
              onWindowChange={setWindowHours}
            />
          </div>
        )}

        {activeTab === 'whales' && (
          <WhalesTable
            rows={whaleRows}
            isLoading={whaleLoading}
            error={whaleError}
            windowHours={windowHours}
            onWindowChange={setWindowHours}
            onRefresh={() => void ensureWhaleRows(true)}
          />
        )}

        {activeTab === 'chat' && (
          <div className="mx-auto w-full max-w-[1160px] px-4 pb-24 pt-8 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-[#030914]/75 p-6">
              <h2 className="text-xl font-semibold text-white">AI Chat</h2>
              <p className="mt-2 text-sm text-white/60">Chat panel is open on the right. Ask about memecoin narratives, smart money flow, and whale activity.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button key={p} type="button" onClick={() => openChatWithPrompt(p)}
                    className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:border-brand-500/50 hover:text-white"
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        <SmartChat
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          initialQuery={initialQuery}
          onClearInitialQuery={() => setInitialQuery('')}
          onFlowSnapshot={(snapshot) => {
            flowCacheRef.current.set(snapshot.windowHours, { snapshot, ts: Date.now() })
            if (snapshot.windowHours === windowHours) setFlowSnapshot(snapshot)
          }}
        />
      </main>

      <MobileBottomBar activeTab={activeTab} onTabChange={setActiveTab} onAskAI={() => { setActiveTab('chat'); setChatOpen(true) }} />
    </div>
  )
}

export default App
