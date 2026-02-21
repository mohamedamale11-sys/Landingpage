"use client";

import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  error?: boolean;
};

type StreamEvent = {
  type?: string;
  text?: string;
  error?: string;
  response_id?: string;
  response?: { answer?: string };
  credits_remaining?: number;
  credits_total?: number;
  daily_credits_remaining?: number;
  daily_credits_total?: number;
};

const STARTER_PROMPTS = [
  "Maxay smart money hadda iibsanayaan?",
  "I sii top inflow tokens 24 saac ee u dambeeyay.",
  "BONK maanta bullish mise bearish?",
  "Sharax wararka ugu saameynta badan maanta.",
];

function makeID() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toHistory(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.text.trim().length > 0)
    .slice(-8)
    .map((m) => ({
      role: m.role,
      content: m.text,
    }));
}

function parseMaybeJSON(raw: string) {
  try {
    const data = JSON.parse(raw);
    if (data && typeof data === "object") return data as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

export function SmartChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeID(),
      role: "assistant",
      text: "Salaan. Waxaan ahay MxCrypto AI. I weydii su'aal ku saabsan smart money, token flow, ama wararka crypto.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [responseID, setResponseID] = useState("");
  const [credits, setCredits] = useState<{
    monthlyRemaining?: number;
    monthlyTotal?: number;
    dailyRemaining?: number;
    dailyTotal?: number;
  }>({});

  const listRef = useRef<HTMLDivElement | null>(null);
  const assistantMsgIDRef = useRef<string>("");

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, statusText, isSending]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  function updateAssistantText(id: string, patch: (prev: string) => string, error = false) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          text: patch(m.text),
          error,
        };
      }),
    );
  }

  async function sendMessage(text: string) {
    const prompt = text.trim();
    if (!prompt || isSending) return;

    const userMsg: ChatMessage = { id: makeID(), role: "user", text: prompt };
    const assistantMsg: ChatMessage = { id: makeID(), role: "assistant", text: "" };
    assistantMsgIDRef.current = assistantMsg.id;

    const history = toHistory(messages);
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsSending(true);
    setStatusText("Waxaan falanqeynayaa...");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream,application/json",
        },
        body: JSON.stringify({
          message: prompt,
          lang: "so",
          history,
          ...(responseID ? { previous_response_id: responseID } : {}),
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/event-stream")) {
        const plain = await res.text();
        const parsed = parseMaybeJSON(plain);
        const answer =
          (parsed?.answer as string | undefined) ||
          (parsed?.error as string | undefined) ||
          `Request failed (${res.status})`;
        updateAssistantText(assistantMsg.id, () => answer, !res.ok);
        setStatusText("");
        return;
      }

      if (!res.body) {
        updateAssistantText(assistantMsg.id, () => "Wax qalad ah ayaa dhacay. Mar kale isku day.");
        setStatusText("");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();
            continue;
          }
          if (!line.startsWith("data:")) continue;

          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          const evt = parseMaybeJSON(payload) as StreamEvent | null;
          if (!evt) continue;
          if (!evt.type && currentEvent) evt.type = currentEvent;
          currentEvent = "";

          switch ((evt.type || "").toLowerCase()) {
            case "credits": {
              setCredits((prev) => ({
                monthlyRemaining:
                  typeof evt.credits_remaining === "number"
                    ? evt.credits_remaining
                    : prev.monthlyRemaining,
                monthlyTotal:
                  typeof evt.credits_total === "number" ? evt.credits_total : prev.monthlyTotal,
                dailyRemaining:
                  typeof evt.daily_credits_remaining === "number"
                    ? evt.daily_credits_remaining
                    : prev.dailyRemaining,
                dailyTotal:
                  typeof evt.daily_credits_total === "number"
                    ? evt.daily_credits_total
                    : prev.dailyTotal,
              }));
              break;
            }
            case "status":
            case "thinking":
              setStatusText((evt.text || "").trim());
              break;
            case "delta":
              if (evt.text) {
                updateAssistantText(assistantMsg.id, (prev) => prev + evt.text);
              }
              break;
            case "done": {
              if (evt.response_id) setResponseID(evt.response_id);
              if (evt.response?.answer) {
                updateAssistantText(assistantMsg.id, (prev) =>
                  prev.trim().length ? prev : evt.response?.answer || "",
                );
              }
              setStatusText("");
              break;
            }
            case "error":
              updateAssistantText(
                assistantMsg.id,
                () => evt.error || "Wax qalad ah ayaa dhacay. Fadlan mar kale isku day.",
                true,
              );
              setStatusText("");
              break;
            default:
              break;
          }
        }
      }
    } catch {
      updateAssistantText(
        assistantMsg.id,
        () => "Server-ka lama gaarin. Hubi internet-ka kadibna mar kale isku day.",
        true,
      );
      setStatusText("");
    } finally {
      setIsSending(false);
      setStatusText((prev) => (prev.toLowerCase().includes("falanqeyn") ? "" : prev));
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="mx-panel mx-shadow-card overflow-hidden">
      <div className="relative border-b mx-hairline px-4 py-5 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(760px_220px_at_55%_-30%,rgba(0,255,170,0.22),transparent_60%)]" />
        <div className="relative">
          <div className="mx-mono inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent)/0.25)] bg-[rgb(var(--accent)/0.08)] px-3 py-1 text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
            <Sparkles size={12} />
            MxCrypto AI
          </div>
          <h1 className="mx-headline mt-3 text-[32px] font-semibold leading-[1.06] text-white sm:text-[42px]">
            Follow The Whales
          </h1>
          <p className="mt-2 max-w-[80ch] text-[14px] text-white/65 sm:text-[15px]">
            Weydii su&apos;aal ku saabsan smart money, inflow/outflow, token analysis, ama wararka cusub.
          </p>
        </div>
      </div>

      <div className="border-b mx-hairline px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isSending}
              onClick={() => void sendMessage(prompt)}
              className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-3 py-2 text-[11px] font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div ref={listRef} className="max-h-[56vh] space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={["flex", m.role === "user" ? "justify-end" : "justify-start"].join(" ")}
          >
            <div
              className={[
                "max-w-[88%] rounded-2xl border px-4 py-3 text-[14px] leading-relaxed sm:max-w-[76%]",
                m.role === "user"
                  ? "border-[rgb(var(--accent)/0.35)] bg-[rgb(var(--accent)/0.12)] text-white"
                  : m.error
                    ? "border-red-400/25 bg-red-500/[0.08] text-red-100"
                    : "mx-hairline bg-white/[0.03] text-white/85",
              ].join(" ")}
            >
              {m.text.trim() ? m.text : <span className="text-white/40">...</span>}
            </div>
          </div>
        ))}

        {isSending && statusText ? (
          <div className="mx-mono text-[11px] text-white/50">{statusText}</div>
        ) : null}
      </div>

      <div className="border-t mx-hairline px-4 py-4 sm:px-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="mx-mono text-[11px] text-white/45">
            {credits.monthlyTotal
              ? `Credits: ${credits.monthlyRemaining ?? 0}/${credits.monthlyTotal}`
              : "MVP chat beta"}
          </div>
          <div className="mx-mono text-[11px] text-white/45">
            {credits.dailyTotal ? `Maalinle: ${credits.dailyRemaining ?? 0}/${credits.dailyTotal}` : ""}
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Su'aashaada qor..."
            className="min-h-[48px] flex-1 resize-none rounded-2xl border mx-hairline bg-black/35 px-4 py-3 text-[14px] text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.25)]"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent))] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Dir"
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
          </button>
        </form>
      </div>
    </section>
  );
}
