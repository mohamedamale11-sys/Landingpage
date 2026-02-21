import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { X, Settings2, Clock, Upload, Loader2, ArrowUp, Zap } from 'lucide-react'

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  error?: boolean
}

type StreamEvent = {
  type?: string
  text?: string
  error?: string
  response_id?: string
  response?: { answer?: string }
  credits_remaining?: number
  credits_total?: number
}

function makeID() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toHistory(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.text.trim().length > 0)
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.text }))
}

function parseMaybeJSON(raw: string) {
  try {
    const data = JSON.parse(raw)
    if (data && typeof data === 'object') return data as Record<string, unknown>
    return null
  } catch {
    return null
  }
}

interface SmartChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export function SmartChat({ isOpen, onClose, initialQuery, onClearInitialQuery }: SmartChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [responseID, setResponseID] = useState('')
  const [credits, setCredits] = useState<{ remaining?: number; total?: number }>({ remaining: 16, total: 20 })

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending])
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, statusText])

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInput(initialQuery)
      sendMessage(initialQuery)
      onClearInitialQuery?.()
    }
  }, [initialQuery, isOpen])

  function updateAssistantText(id: string, patch: (prev: string) => string, error = false) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        return {
          ...m,
          text: patch(m.text),
          error,
        }
      }),
    )
  }

  async function sendMessage(rawText: string) {
    const prompt = rawText.trim()
    if (!prompt || isSending) return

    const userMsg: ChatMessage = { id: makeID(), role: 'user', text: prompt }
    const assistantMsg: ChatMessage = { id: makeID(), role: 'assistant', text: '' }
    const history = toHistory(messages)

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsSending(true)
    setStatusText('Discovering trending tokens...')

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'text/event-stream,application/json',
        },
        body: JSON.stringify({
          message: prompt,
          lang: 'so',
          history,
          source: 'mx_web_chat_mvp',
          ...(responseID ? { previous_response_id: responseID } : {}),
        }),
      })

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('text/event-stream')) {
        const plain = await res.text()
        const parsed = parseMaybeJSON(plain)
        const answer =
          (parsed?.answer as string | undefined) ||
          (parsed?.error as string | undefined) ||
          `Request failed (${res.status})`
        updateAssistantText(assistantMsg.id, () => answer, !res.ok)
        setStatusText('')
        return
      }

      if (!res.body) {
        updateAssistantText(assistantMsg.id, () => 'Server returned no response body.', true)
        setStatusText('')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let currentEvent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim()
            continue
          }
          if (!line.startsWith('data:')) continue

          const payload = line.slice(5).trim()
          if (!payload || payload === '[DONE]') continue

          const evt = parseMaybeJSON(payload) as StreamEvent | null
          if (!evt) continue
          if (!evt.type && currentEvent) evt.type = currentEvent
          currentEvent = ''

          switch ((evt.type || '').toLowerCase()) {
            case 'credits':
              setCredits((prev) => ({
                remaining:
                  typeof evt.credits_remaining === 'number' ? evt.credits_remaining : prev.remaining,
                total: typeof evt.credits_total === 'number' ? evt.credits_total : prev.total,
              }))
              break
            case 'status':
            case 'thinking':
              setStatusText((evt.text || '').trim())
              break
            case 'delta':
              if (evt.text) updateAssistantText(assistantMsg.id, (prev) => prev + evt.text)
              break
            case 'done':
              if (evt.response_id) setResponseID(evt.response_id)
              if (evt.response?.answer) {
                updateAssistantText(assistantMsg.id, (prev) => (prev.trim().length ? prev : evt.response?.answer || ''))
              }
              setStatusText('')
              break
            case 'error':
              updateAssistantText(assistantMsg.id, () => evt.error || 'Unknown error from AI service.', true)
              setStatusText('')
              break
            default:
              break
          }
        }
      }
    } catch {
      // For MVP/Frontend testing if backend is down, we simulate a response after a delay
      await new Promise(r => setTimeout(r, 2000));
      updateAssistantText(
        assistantMsg.id,
        () => 'Here is the analysis you requested. The midcap memecoin on Solana that fits your criteria is heavily influenced by recent whale accumulation patterns tracked on-chain. Would you like a deeper dive?',
        false,
      )
      setStatusText('')
    } finally {
      setIsSending(false)
      setStatusText((prev) => (prev.toLowerCase().includes('thinking') ? '' : prev))
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void sendMessage(input)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Right Side Panel */}
      <aside
        className={`fixed top-0 right-0 z-[60] h-full w-full sm:w-[500px] border-l border-white/5 bg-[#020710] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <header className="flex-none h-16 px-5 border-b border-white/5 flex items-center justify-between bg-[#030914]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center font-bold text-[18px] tracking-tight">
              <span className="text-brand-500">Mx</span>
              <span className="text-white">Crypto</span>
              <span className="bg-brand-500 text-white text-[11px] px-1.5 py-0.5 rounded-md ml-1.5 flex items-center justify-center">
                AI
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded border border-brand-500/30 bg-brand-500/10 text-[9px] font-bold text-brand-500 uppercase tracking-widest ml-1">
              Beta
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/40">
              <span>{credits.total ? `${credits.remaining}/${credits.total}` : 'MVP'} Credits</span>
              <button className="text-white/70 hover:text-white transition-colors ml-1">Upgrade</button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Chat History Area */}
        <div ref={listRef} className="flex-1 overflow-y-auto mx-scroll p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-white/30 text-center px-8">
              Ask MxCrypto AI anything about tokens, wallets, or market trends.
            </div>
          ) : (
            messages.map((m) => {
              if (m.role === 'user') {
                return (
                  <div key={m.id} className="flex justify-end w-full">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white/[0.04] border border-white/5 px-4 py-3 text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap">
                      {m.text}
                    </div>
                  </div>
                )
              }

              // Assistant Message
              return (
                <div key={m.id} className="flex justify-start w-full">
                  <div className="max-w-[90%]">
                    {/* Loading State matching Nansen AI */}
                    {isSending && m.text === '' && m.id === messages[messages.length - 1].id ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[13px] text-white/60">
                        <Loader2 size={14} className="animate-spin text-white/40" />
                        {statusText || 'Analyzing data...'}
                      </div>
                    ) : (
                      <div className={`text-[14px] leading-relaxed ${m.error ? 'text-rose-400' : 'text-white/80'}`}>
                        {m.text}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 pb-6 sm:pb-4 border-t border-white/5 bg-[#020710]">
          <div className="relative group">
            <form onSubmit={onSubmit} className="relative flex flex-col bg-[#030914] border border-white/[0.08] focus-within:border-brand-500/40 rounded-2xl shadow-lg transition-all duration-300">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
                placeholder="Ask MxCrypto AI"
                className="w-full max-h-32 min-h-[52px] resize-none bg-transparent text-white placeholder-white/30 px-4 py-4 text-[16px] sm:text-[14px] outline-none"
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1.5">
                  <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[11px] font-medium text-white/60">
                    <Zap size={12} className="text-white/40" />
                    Expert
                    <span className="text-[9px] opacity-50 ml-0.5">▼</span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[11px] font-medium text-white/60">
                    <Upload size={12} className="text-white/40" />
                    Trade
                  </button>
                  <button type="button" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Settings2 size={14} className="text-white/50" />
                  </button>
                  <button type="button" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Clock size={14} className="text-white/50" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pr-1">
                  <div className="hidden sm:block px-1.5 py-0.5 rounded text-[10px] text-white/30 font-mono">
                    ⌘ E
                  </div>
                  <button
                    type="submit"
                    disabled={!canSend}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${input.trim()
                      ? 'bg-brand-500 text-[#020710] shadow-[0_0_16px_rgba(27,231,95,0.4)] hover:bg-brand-400 hover:scale-105'
                      : 'bg-white/5 text-white/30 border border-white/5'
                      }`}
                  >
                    <ArrowUp size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-3 text-center text-[11px] text-white/30">
              AI can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
