import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Orb } from "@/components/os/Atmosphere";
import { StatusBadge } from "@/components/os/SiteChrome";
import { spring } from "@/components/os/motion";
import { loadSessions, mockReply, saveSessions, titleFrom, uid, type Session } from "@/lib/mock-ai";
import { usePrefs } from "@/lib/prefs";
import { playTone } from "@/lib/audio";

export const Route = createFileRoute("/chat")({
  validateSearch: z.object({ q: z.string().max(2000).optional() }),
  head: () => ({
    meta: [
      { title: "Chat Workspace — ARTYVERSE X" },
      { name: "description", content: "Chat workspace with local session history and a clearly labeled mock responder." },
      { property: "og:title", content: "Chat Workspace — ARTYVERSE X" },
      { property: "og:description", content: "Local session history with a labeled mock responder." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { prefs } = usePrefs();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const consumed = useRef(false);

  useEffect(() => {
    const s = loadSessions();
    setSessions(s);
    setActiveId(s[0]?.id ?? null);
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) saveSessions(sessions); }, [sessions, loaded]);

  const active = sessions.find((s) => s.id === activeId) ?? null;
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [active?.messages.length, thinking]);

  const send = (text: string, forceNew = false) => {
    const t = text.trim();
    if (!t || thinking) return;
    playTone("send", prefs.sound, prefs.volume);
    const userMsg = { id: uid(), role: "user" as const, text: t, at: Date.now() };
    const exists = !forceNew && activeId && sessions.some((s) => s.id === activeId);
    let sid: string;
    if (exists) {
      sid = activeId!;
      setSessions((prev) => prev.map((s) => (s.id === sid ? { ...s, messages: [...s.messages, userMsg], updatedAt: Date.now() } : s)));
    } else {
      sid = uid();
      setSessions((prev) => [{ id: sid, title: titleFrom(t), messages: [userMsg], updatedAt: Date.now() }, ...prev]);
    }
    setActiveId(sid);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      const reply = { id: uid(), role: "assistant" as const, text: mockReply(t), at: Date.now(), mock: true };
      setSessions((prev) => prev.map((s) => (s.id === sid ? { ...s, messages: [...s.messages, reply], updatedAt: Date.now() } : s)));
      setThinking(false);
      playTone("success", prefs.sound, prefs.volume);
    }, 650);
  };

  useEffect(() => {
    if (loaded && q && !consumed.current) {
      consumed.current = true;
      send(q, true);
      navigate({ to: "/chat", search: {}, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, q]);

  const remove = (id: string) => {
    setSessions((p) => p.filter((s) => s.id !== id));
    if (id === activeId) setActiveId(null);
  };

  return (
    <section aria-labelledby="chat-h" className="py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 id="chat-h" className="text-3xl font-bold sm:text-4xl">Chat workspace</h1>
        <StatusBadge kind="demo" />
      </div>
      <p role="note" className="mb-6 rounded-2xl border border-pink/30 bg-pink/5 px-4 py-3 text-sm text-muted-foreground">
        No AI model is connected. Replies are generated locally by simple rules so you can try the workflow. Session history is real and saved in this browser.
      </p>
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside aria-label="Sessions" className="glass rounded-3xl p-3">
          <button onClick={() => setActiveId(null)} className="mb-2 flex w-full items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" /> New session
          </button>
          {sessions.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No sessions yet.</p>}
          <ul className="max-h-64 space-y-1 overflow-y-auto lg:max-h-[28rem]">
            {sessions.map((s) => (
              <li key={s.id} className={`group flex items-center rounded-2xl ${s.id === activeId ? "bg-secondary" : ""}`}>
                <button onClick={() => setActiveId(s.id)} className="flex-1 truncate px-3 py-2 text-left text-sm" aria-current={s.id === activeId}>
                  {s.title}
                </button>
                <button onClick={() => remove(s.id)} aria-label={`Delete ${s.title}`} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          {sessions.length > 0 && (
            <button onClick={() => { setSessions([]); setActiveId(null); }} className="mt-2 w-full rounded-2xl px-3 py-2 text-xs text-muted-foreground hover:text-destructive">
              Clear all history
            </button>
          )}
        </aside>

        <div className="glass flex min-h-[60vh] flex-col rounded-3xl">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {!active && !thinking && (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
                <Orb size={80} />
                <p className="text-muted-foreground">Start a new session below.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {active?.messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-secondary"}`}>
                    {m.mock && <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-pink">Mock response</span>}
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {thinking && <p className="font-mono text-xs text-muted-foreground">Generating local mock…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-border p-3">
            <label htmlFor="chat-input" className="sr-only">Message</label>
            <textarea id="chat-input" rows={1} value={input} maxLength={2000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Message (Enter to send, Shift+Enter for newline)"
              className="min-h-11 flex-1 resize-none rounded-2xl bg-transparent px-3 py-2.5 outline-none placeholder:text-muted-foreground" />
            <button type="submit" disabled={!input.trim() || thinking} aria-label="Send"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-40">
              <ArrowUp className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
