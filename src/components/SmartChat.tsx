import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowUp, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { applyFlowBlock, createEmptyFlowSnapshot, type FlowSnapshot } from '../lib/flow'

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
  block?: unknown
  data?: unknown
  error?: string
  error_code?: string
  retry_after_seconds?: number
  response_id?: string
  response?: { answer?: string }
  credits_remaining?: number
  credits_total?: number
  daily_credits_remaining?: number
  daily_credits_total?: number
}

interface SmartChatProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  onClearInitialQuery?: () => void
  onFlowSnapshot?: (snapshot: FlowSnapshot) => void
}

const WINDOW_OPTIONS = [6, 24, 72]
const DEFAULT_WINDOW_HOURS = 24

const STARTER_PROMPTS = [
  'Show me the biggest whale buys in the last 24 hours',
  'What is the overall smart money flow direction today?',
  'Which token has strongest inflow right now?',
  'Which token has strongest outflow right now?',
]

const SOMALI_WORDS = [
  'maxaa',
  'sidee',
  'goorma',
  'fadlan',
  'waxaan',
  'iibs',
  'iibi',
  'falanq',
  'suuq',
  'hadda',
]

const ENGLISH_WORDS = ['what', 'how', 'when', 'please', 'buy', 'sell', 'analy', 'market', 'chart', 'now']
const FOLLOWUP_HINTS = [
  'it',
  'that',
  'this',
  'those',
  'them',
  'why',
  'how',
  'which one',
  'the one',
  'same one',
]

function makeID() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function parseMaybeJSON(raw: string) {
  try {
    const data = JSON.parse(raw)
    if (data && typeof data === 'object') return data as Record<string, unknown>
  } catch {
    // ignore
  }
  return null
}

function normalizeLangCode(raw: string) {
  const lowered = raw.trim().toLowerCase()
  return lowered.startsWith('so') ? 'so' : 'en'
}

function keywordScore(text: string, words: string[]) {
  return words.reduce((score, word) => (word && text.includes(word) ? score + 1 : score), 0)
}

function preferredChatLanguage(message: string, fallback: string) {
  const fallbackLang = normalizeLangCode(fallback)
  const lower = message.trim().toLowerCase()
  if (lower.length === 0) return fallbackLang

  for (const rune of lower) {
    const code = rune.codePointAt(0) || 0
    if (code >= 0x0600 && code <= 0x06ff) return 'so'
  }

  const soScore = keywordScore(lower, SOMALI_WORDS)
  const enScore = keywordScore(lower, ENGLISH_WORDS)

  if (soScore >= 2 && soScore >= enScore + 1) return 'so'
  if (enScore >= 2 && enScore > soScore) return 'en'

  return fallbackLang
}

function toHistory(messages: ChatMessage[], maxEntries = 6) {
  const history = messages
    .filter((m) => !m.error && m.text.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.text }))

  return history.length <= maxEntries ? history : history.slice(history.length - maxEntries)
}

function normalizeInline(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function extractTickers(text: string) {
  const matches = text.match(/\$[A-Za-z0-9_]{2,20}/g) || []
  const uniq = Array.from(new Set(matches.map((m) => m.toUpperCase())))
  return uniq.slice(0, 4)
}

function looksLikeFollowUp(prompt: string) {
  const p = prompt.trim().toLowerCase()
  if (!p) return false

  // Don't treat every short prompt as follow-up; only use clear follow-up cues.
  if (FOLLOWUP_HINTS.some((hint) => p.includes(hint))) return true

  // Short continuation prompts.
  if (p.length <= 28) {
    if (/\b(why|how|more|details|explain|compare|same)\b/.test(p)) return true
  }
  return false
}

function buildContextualPrompt(prompt: string, messages: ChatMessage[]) {
  const clean = prompt.trim()
  if (!looksLikeFollowUp(clean)) return clean

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && !m.error && m.text.trim().length > 0)
  if (!lastAssistant) return clean

  const assistantText = normalizeInline(lastAssistant.text).slice(0, 420)
  if (!assistantText) return clean

  const tickers = extractTickers(lastAssistant.text)
  const tickerHint = tickers.length > 0 ? `Likely referenced token(s): ${tickers.join(', ')}.` : ''

  return [
    'Follow-up question in ongoing chat. Resolve pronouns using previous assistant response.',
    tickerHint,
    `Previous assistant response: ${assistantText}`,
    `User follow-up: ${clean}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function pickErrorMessage(decoded: Record<string, unknown> | null, statusCode: number, rawBody: string) {
  const fromDecoded = typeof decoded?.error === 'string' ? decoded.error.trim() : ''
  if (fromDecoded) return fromDecoded

  const body = rawBody.trim()
  if (!body) return `HTTP ${statusCode}`

  const lowered = body.toLowerCase()
  if (lowered.includes('<html') || lowered.includes('<!doctype html')) {
    return 'Server returned an unexpected response.'
  }
  return body.length > 240 ? `${body.slice(0, 240)}...` : body
}

function mapStatus(raw?: string) {
  const v = (raw || '').trim()
  if (!v) return 'Thinking...'
  const lowered = v.toLowerCase()
  if (lowered.includes('think')) return 'Thinking...'
  if (lowered.includes('fetch')) return 'Fetching data...'
  if (lowered.includes('analyz')) return 'Analyzing...'
  return v
}

function formatStreamError(evt: StreamEvent) {
  const base = (evt.error || 'Unknown error').trim()
  if (evt.retry_after_seconds && evt.retry_after_seconds > 0) {
    return `${base} (retry in ${evt.retry_after_seconds}s)`
  }
  return base
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={`md-${idx}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={`txt-${idx}`}>{part}</span>
  })
}

function renderAssistantText(text: string) {
  const lines = text.split(/\r?\n/).filter((line, idx, all) => !(line.trim() === '' && idx === all.length - 1))
  return (
    <div className="space-y-4">
      {lines.map((line, idx) => {
        const clean = line.trim()
        if (clean.length === 0) return <div key={`sp-${idx}`} className="h-1" />
        const isBullet = /^[-*]\s+/.test(clean)
        const content = clean.replace(/^[-*]\s+/, '')
        return (
          <p key={`p-${idx}`} className={`text-[14.5px] leading-[1.8] tracking-[0.01em] ${isBullet ? 'pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-500/50' : ''}`}>
            {renderInlineMarkdown(content)}
          </p>
        )
      })}
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1">
      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-brand-500" />
      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-brand-500" />
      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-brand-500" />
    </div>
  )
}

export function SmartChat({ isOpen, onClose, initialQuery, onClearInitialQuery, onFlowSnapshot }: SmartChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [responseID, setResponseID] = useState('')
  const [windowHours, setWindowHours] = useState(DEFAULT_WINDOW_HOURS)
  const [credits, setCredits] = useState<{
    remaining?: number
    total?: number
    dailyRemaining?: number
    dailyTotal?: number
  }>({})

  const listRef = useRef<HTMLDivElement | null>(null)
  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending])
  const initialSentRef = useRef('')

  const endpoint = useMemo(() => {
    const base = (import.meta.env.VITE_API_BASE || '').toString().trim()
    if (!base) return '/api/ai/chat'
    return `${base.replace(/\/+$/, '')}/api/ai/chat`
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, statusText, isSending])

  useEffect(() => {
    if (!initialQuery || !isOpen) return
    const q = initialQuery.trim()
    if (!q) return
    if (initialSentRef.current === q) return

    initialSentRef.current = q
    void sendMessage(q)
    onClearInitialQuery?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const history = toHistory(messages, 10)
    const modelPrompt = buildContextualPrompt(prompt, messages)
    const fallbackLang = normalizeLangCode(navigator.language || 'en')
    const lang = preferredChatLanguage(prompt, fallbackLang)
    let snapshot = createEmptyFlowSnapshot(windowHours)

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsSending(true)
    setStatusText('Thinking...')

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream,application/json',
        },
        body: JSON.stringify({
          message: modelPrompt,
          lang,
          window_hours: windowHours,
          include_blocks: true,
          ...(responseID ? { previous_response_id: responseID } : {}),
          ...(history.length ? { history } : {}),
        }),
      })

      const contentType = (res.headers.get('content-type') || '').toLowerCase()

      if (res.status >= 400 && !contentType.includes('text/event-stream')) {
        const body = await res.text()
        const decoded = parseMaybeJSON(body)
        updateAssistantText(assistantMsg.id, () => pickErrorMessage(decoded, res.status, body), true)
        setStatusText('')
        return
      }

      if (!contentType.includes('text/event-stream')) {
        const body = await res.text()
        const decoded = parseMaybeJSON(body)

        if (decoded && decoded.ok === true) {
          const answer = typeof decoded.answer === 'string' ? decoded.answer : ''
          if (answer) updateAssistantText(assistantMsg.id, () => answer)
          if (typeof decoded.response_id === 'string') setResponseID(decoded.response_id)
          setStatusText('')
          return
        }

        updateAssistantText(assistantMsg.id, () => pickErrorMessage(decoded, res.status, body), true)
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
                remaining: typeof evt.credits_remaining === 'number' ? evt.credits_remaining : prev.remaining,
                total: typeof evt.credits_total === 'number' ? evt.credits_total : prev.total,
                dailyRemaining:
                  typeof evt.daily_credits_remaining === 'number' ? evt.daily_credits_remaining : prev.dailyRemaining,
                dailyTotal: typeof evt.daily_credits_total === 'number' ? evt.daily_credits_total : prev.dailyTotal,
              }))
              break
            case 'status':
            case 'thinking':
              setStatusText(mapStatus(evt.text))
              break
            case 'block': {
              const rawBlock = evt.block ?? evt.data
              if (rawBlock) {
                snapshot = applyFlowBlock(snapshot, rawBlock)
                if (snapshot.inflow.length > 0 || snapshot.outflow.length > 0) {
                  onFlowSnapshot?.(snapshot)
                }
              }
              break
            }
            case 'delta':
              if (evt.text) updateAssistantText(assistantMsg.id, (prev) => prev + evt.text)
              break
            case 'done':
              if (evt.response_id) setResponseID(evt.response_id)
              if (evt.response?.answer) {
                updateAssistantText(assistantMsg.id, (prev) =>
                  prev.trim().length ? prev : evt.response?.answer || '',
                )
              }
              setStatusText('')
              break
            case 'error':
              updateAssistantText(assistantMsg.id, () => formatStreamError(evt), true)
              setStatusText('')
              break
            default:
              break
          }
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Cannot reach server. Check backend and try again.'
      updateAssistantText(assistantMsg.id, () => msg, true)
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
      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-[60] flex h-full w-full flex-col border-l border-white/5 bg-[#020710] pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-300 ease-in-out sm:w-[480px] ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <header className="flex h-14 flex-none items-center justify-between border-b border-white/5 bg-[#030914]/80 px-4 backdrop-blur-md">
          <div className="flex items-center text-[18px] font-semibold tracking-tight">
            <span className="text-brand-500">Mx</span>
            <span className="text-white">Crypto</span>
            <span className="ml-1.5 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-[#020710]">AI</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-[11px] font-medium text-white/40">
              {credits.total ? `${credits.remaining ?? 0}/${credits.total}` : 'Credits'}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
          <span className="mr-1 text-[11px] uppercase tracking-[0.14em] text-white/40">Window</span>
          {WINDOW_OPTIONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setWindowHours(h)}
              className={[
                'rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition',
                windowHours === h
                  ? 'border-brand-500/35 bg-brand-500/10 text-brand-500'
                  : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              {h}h
            </button>
          ))}
        </div>

        <div ref={listRef} className="mx-scroll flex-1 space-y-5 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full px-2 pt-2">
              <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
                <Sparkles size={15} className="text-brand-500" />
                Ask about smart money inflow/outflow and whale activity.
              </div>
              <div className="flex flex-wrap gap-2.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="max-w-full truncate rounded-2xl border border-white/10 bg-[#060b13]/80 px-4 py-3 text-left text-[13px] font-medium text-white/70 transition-all duration-300 hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-white shadow-lg backdrop-blur"
                    title={prompt}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              if (m.role === 'user') {
                return (
                  <div key={m.id} className="flex justify-end mb-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-transparent px-5 py-3.5 text-[14.5px] leading-relaxed text-white shadow-lg backdrop-blur-md"
                    >
                      {m.text}
                    </motion.div>
                  </div>
                )
              }

              return (
                <div key={m.id} className="flex justify-start mb-6 group">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <div className="w-8 h-8 rounded-full border border-brand-500/30 bg-brand-500/10 flex items-center justify-center shadow-[0_0_10px_rgba(27,231,95,0.15)]">
                      <Sparkles size={14} className="text-brand-500" />
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="min-w-0 flex-1 max-w-[calc(100%-3rem)]"
                  >
                    {isSending && m.text === '' && m.id === messages[messages.length - 1].id ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-brand-500/20 bg-[#060b13]/80 backdrop-blur-md px-5 py-3.5 text-[13px] font-medium text-brand-400 shadow-lg inline-flex">
                        <ThinkingIndicator />
                        <span className="ml-1 tracking-wide">{statusText || 'Analyzing...'}</span>
                      </div>
                    ) : (
                      <div className={m.error ? 'text-rose-400 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10' : 'text-white/90 py-1'}>
                        {renderAssistantText(m.text)}
                      </div>
                    )}
                  </motion.div>
                </div>
              )
            })
          )}

          <AnimatePresence>
            {isSending && statusText && messages.length > 0 && messages[messages.length - 1].text !== '' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-medium uppercase tracking-widest text-brand-500/50 pl-11"
              >
                {statusText}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          className="flex-none border-t border-white/5 bg-[#020710] p-3 pb-3"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <form
            onSubmit={onSubmit}
            className="relative flex items-end gap-2 rounded-md border border-white/20 bg-[#060b13] p-2 shadow-2xl transition-all duration-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/50"
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void sendMessage(input)
                }
              }}
              placeholder="Ask MxCrypto AI"
              className="min-h-[44px] max-h-32 w-full resize-none bg-transparent px-3 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30 sm:text-[14px]"
            />
            <button
              type="submit"
              disabled={!canSend}
              className={`mb-1 mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded transition-all duration-300 ${input.trim()
                ? 'bg-brand-500 text-[#020710] shadow-[0_0_15px_rgba(27,231,95,0.6)] hover:bg-brand-400 active:scale-95'
                : 'bg-white/10 text-white/40'
                }`}
            >
              <ArrowUp size={18} strokeWidth={3} />
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
