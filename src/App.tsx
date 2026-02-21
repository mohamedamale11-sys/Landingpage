import { useState } from 'react';
import {
  Home,
  Briefcase,
  Coins,
  Search,
  Link,
  Signal,
  Smartphone,
  Star,
  Activity,
  History,
  Lock,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Settings,
  Menu,
  ChevronDown,
  ChevronUp,
  Download,
  Settings2,
  ArrowUp,
  PanelLeftClose,
  MoreHorizontal,
  Sparkles,
  PieChart
} from 'lucide-react';

// Using a placeholder SmartChat for the MVP integration
import { SmartChat } from './components/SmartChat';
import mxMark from './assets/mxcrypto-mark.png';

const SIDEBAR_TOP = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Smart Money', icon: Activity },
  { label: 'Tokens', icon: Coins },
];

const PROFILER_SUB = [
  { label: 'Wallet Profiler' },
  { label: 'Token Profiler' },
  { label: 'Deep Research' },
];

const SIDEBAR_MID = [
  { label: 'Chains', icon: Link },
  { label: 'AI Signals', icon: Signal },
  { label: 'Get Mobile App', icon: Smartphone },
];

const SIDEBAR_BOTTOM = [
  { label: 'Points', icon: Star, badge: '40 NXP' },
  { label: 'Stake', icon: Lock },
  { label: 'Portfolio', icon: Briefcase },
  { label: 'Smart Alerts', icon: Activity },
  { label: 'Watchlists', icon: Star },
];

const HISTORY_SUB = [
  { label: 'Tokens', sub: 'what sectors dominate Smar...', type: 'text' },
  { label: 'Tokens', sub: 'identify tokens with inc...', type: 'text' },
  { label: 'Profiler / 😎 👽 cryptovillai...', type: 'profile' },
  { label: 'Token God Mode / ABU...', type: 'token' },
  { label: 'AI Signals', sub: 'why is SPX...', type: 'text' },
];

const SIDEBAR_FOOTER = [
  { label: 'Get Started', icon: Star, alert: true },
  { label: 'MxCrypto API', icon: Link },
  { label: 'What\'s New', icon: MoreHorizontal },
  { label: 'Academy', icon: BookOpen },
  { label: 'Help', icon: HelpCircle },
  { label: 'Settings', icon: Settings },
];

function SideNav() {
  const [profilerOpen, setProfilerOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <aside className="hidden w-[260px] flex-col border-r border-white/5 bg-[#030914] text-sm lg:flex h-screen sticky top-0 overflow-y-auto mx-scroll pb-6">
      <div className="flex flex-col px-4 py-5 gap-4">
        <div className="flex items-center gap-2 px-2 text-white/90 hover:text-white cursor-pointer transition-colors mt-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-transparent">
            <img src={mxMark} alt="MxCrypto Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(27,231,95,0.6)]" />
          </div>
          <span className="font-semibold text-[17px] tracking-wide ml-1">MxCrypto AI</span>
          <ChevronDown size={14} className="text-white/40 ml-1" />
        </div>
        <div className="px-2 text-[13px] flex items-center gap-1.5">
          <span className="text-white/40">$0</span>
          <span className="text-brand-500 font-medium">Deposit Funds</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-6">
        {/* Top Section */}
        <div className="space-y-0.5">
          {SIDEBAR_TOP.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${item.active
                ? 'bg-brand-500/10 text-brand-500'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={16} className={item.active ? 'text-brand-500' : 'text-white/40'} />
              {item.label}
            </button>
          ))}

          {/* Profiler Collapsible */}
          <div className="pt-0.5">
            <button
              onClick={() => setProfilerOpen(!profilerOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Search size={16} className="text-white/40" />
                Profiler
              </div>
              {profilerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {profilerOpen && (
              <div className="ml-9 mt-1 space-y-1 relative before:absolute before:inset-y-0 before:-left-3 before:w-px before:bg-white/10">
                {PROFILER_SUB.map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center rounded-lg py-1.5 pl-2 text-[13px] text-white/50 hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {SIDEBAR_MID.map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            >
              <item.icon size={16} className="text-white/40" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Middle Section */}
        <div className="space-y-0.5 pt-4 border-t border-white/5">
          {SIDEBAR_BOTTOM.map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className="text-white/40" />
                {item.label}
              </div>
              {item.badge && (
                <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-500">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* History Section */}
        <div className="pt-4 border-t border-white/5">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex w-full items-center justify-between px-3 py-1 mb-2 text-[11px] font-semibold tracking-wider text-white/40 uppercase hover:text-white/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History size={14} />
              HISTORY
            </div>
            {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {historyOpen && (
            <div className="space-y-1">
              {HISTORY_SUB.map((item, i) => (
                <button
                  key={i}
                  className="flex flex-col w-full text-left rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors group"
                >
                  <span className="text-[12px] font-medium text-white/60 group-hover:text-white/80 line-clamp-1">{item.label}</span>
                  {item.sub && <span className="text-[11px] text-white/30 line-clamp-1 mt-0.5">{item.sub}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="pt-4 border-t border-white/5 space-y-0.5">
          {SIDEBAR_FOOTER.map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors relative"
            >
              <item.icon size={16} className="text-white/40" />
              {item.label}
              {item.alert && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-8 px-5 pb-6">
        <button className="flex items-center gap-2 text-[13px] text-white/40 hover:text-white/60 transition-colors">
          <PanelLeftClose size={14} />
          Collapse Menu
        </button>
      </div>
    </aside>
  );
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setInitialQuery(query);
    setChatOpen(true);
    setSearchQuery(''); // Optional: clear the main input after searching
  };

  const SUGGESTIONS = [
    'What sectors dominate Smart Money holding...',
    'Identify tokens with increasing whale accumu...',
    'Why is SPX...'
  ];

  return (
    <div className="min-h-screen bg-[#020710] text-white font-sans flex selection:bg-brand-500/30 pb-20 lg:pb-0">
      <SideNav />

      {/* Floating "Ask AI" Button (Desktop/Tablet) */}
      <button
        onClick={() => setChatOpen(true)}
        className="hidden sm:flex fixed bottom-6 right-6 z-40 items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 text-[#020710] px-5 py-3.5 shadow-[0_8px_32px_rgba(27,231,95,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(27,231,95,0.4)] group"
      >
        <Sparkles size={18} className="animate-pulse" />
        <span className="font-semibold text-[15px] tracking-wide">Ask AI</span>
      </button>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#020710]/95 backdrop-blur-md border-t border-white/5 px-2 py-3 pb-6">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          <button className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-colors">
            <Home size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-colors">
            <Coins size={20} />
            <span className="text-[10px] font-medium">Tokens</span>
          </button>

          {/* Center Ask AI Button */}
          <div className="relative -top-6">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-md" />
            <button
              onClick={() => setChatOpen(true)}
              className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-[#020710] shadow-[0_8px_24px_rgba(27,231,95,0.4)] border-4 border-[#020710] transform transition-transform active:scale-95"
            >
              <Sparkles size={24} className="animate-pulse" />
            </button>
          </div>

          <button className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-colors">
            <PieChart size={20} />
            <span className="text-[10px] font-medium">Portfolio</span>
          </button>

          <button className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-colors">
            <Settings size={20} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 bg-[#020710]/80 backdrop-blur-md">
          <div className="flex items-center gap-6 h-full">
            <button className="lg:hidden p-1.5 -ml-2 text-white/60 hover:text-white">
              <Menu size={20} />
            </button>
            <div className="flex h-full items-center gap-6">
              <button className="h-full border-b-2 border-brand-500 text-[14px] font-medium text-brand-500 tracking-wide">
                MxCrypto Terminal
              </button>
              <button className="h-full border-b-2 border-transparent text-[14px] font-medium text-white/50 hover:text-white/80 transition-colors tracking-wide">
                My Dashboard
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full p-1 pl-3 border border-white/5">
              <span className="text-[12px] font-medium text-white/60 mr-1">Token Screener</span>
              <div className="w-8 h-4 rounded-full bg-white/10 relative cursor-pointer">
                <div className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white/40 shadow-sm" />
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-[13px] font-medium text-white/80">
              <MessageSquare size={14} className="text-white/60" />
              Feedback
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center -mt-20">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="w-full max-w-[800px] px-6 relative z-10 flex flex-col items-center">
            {/* Beta Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-brand-500 border border-brand-500/30 bg-brand-500/10 mb-6">
              BETA
            </div>

            {/* Main Header */}
            <h1 className="text-[32px] sm:text-[40px] md:text-[44px] font-semibold text-white tracking-tight mb-10 text-center">
              What Did Smart Money Trade Today?
            </h1>

            {/* Search Input Box */}
            <div className="w-full relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/20 via-brand-500/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex flex-col bg-[#030914]/80 backdrop-blur-xl border border-brand-500/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 focus-within:border-brand-500/60 focus-within:bg-[#030914]">

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(searchQuery);
                  }}
                  placeholder="Ask MxCrypto AI"
                  className="w-full bg-transparent text-white placeholder-white/30 px-5 pt-5 pb-4 text-[16px] sm:text-[15px] outline-none"
                />

                {/* Input Toolbar */}
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-[12px] font-medium text-white/70">
                      <Download size={12} className="text-white/50" />
                      Export
                      <ChevronDown size={12} className="ml-0.5 opacity-50" />
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-[12px] font-medium text-white/70">
                      <Lock size={12} className="text-white/50" />
                      Trade
                    </button>
                    <button className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                      <Settings2 size={14} className="text-white/60" />
                    </button>
                    <div className="flex items-center gap-1.5 ml-1 px-2 py-1 rounded-lg text-[11px] font-medium text-white/40">
                      <Activity size={12} />
                      14/20 Credits
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-white/30 font-mono tracking-wider">
                      ⌘ F
                    </div>
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${searchQuery ? 'bg-brand-500 text-[#020710] hover:bg-brand-400 shadow-[0_0_15px_rgba(27,231,95,0.4)]' : 'bg-white/5 text-white/30 border border-white/5'}`}
                    >
                      <ArrowUp size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(suggestion.replace('...', ''))}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-[13px] text-white/60 hover:text-white/90 backdrop-blur-sm max-w-full truncate"
                  title={suggestion}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <SmartChat
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                initialQuery={initialQuery}
                onClearInitialQuery={() => setInitialQuery('')}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
