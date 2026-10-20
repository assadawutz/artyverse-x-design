import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUp, Bot, LayoutGrid, Mic, Settings2, Sparkles, Waves } from "lucide-react";
import { useState } from "react";
import { Orb } from "@/components/os/Atmosphere";
import { Magnetic, Reveal, spring } from "@/components/os/motion";
import { StatusBadge } from "@/components/os/SiteChrome";
import { usePrefs } from "@/lib/prefs";
import { playTone } from "@/lib/audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARTYVERSE X — Intelligence, in motion" },
      { name: "description", content: "Design OS 3.0: a cinematic local-first workspace with chat, interview studio and templates." },
      { property: "og:title", content: "ARTYVERSE X — Intelligence, in motion" },
      { property: "og:description", content: "Design OS 3.0: a cinematic local-first creative workspace." },
    ],
  }),
  component: Index,
});

const SUGGESTIONS = ["Suggest a neon color palette", "Outline a landing page hero", "Give me an interview question"];

function Composer() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { prefs } = usePrefs();
  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    playTone("send", prefs.sound, prefs.volume);
    navigate({ to: "/chat", search: { q: t } });
  };
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(q); }}
      className="glass mx-auto w-full max-w-2xl rounded-3xl p-2 shadow-glow"
    >
      <label htmlFor="composer" className="sr-only">Ask ARTYVERSE</label>
      <div className="flex items-end gap-2">
        <textarea
          id="composer"
          rows={2}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(q); } }}
          placeholder="Describe what you want to design…"
          className="min-h-[56px] flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground"
          maxLength={2000}
        />
        <Magnetic>
          <button type="submit" disabled={!q.trim()} aria-label="Send to chat workspace"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground transition disabled:opacity-40">
            <ArrowUp className="h-5 w-5" />
          </button>
        </Magnetic>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-2">
        {SUGGESTIONS.map((s) => (
          <button type="button" key={s} onClick={() => submit(s)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground">
            {s}
          </button>
        ))}
        <span className="ml-auto"><StatusBadge kind="demo" /></span>
      </div>
    </form>
  );
}

const FEATURES = [
  { to: "/chat", icon: Bot, title: "AI Chat Workspace", body: "Sessions saved locally. Replies come from a labeled rule-based mock.", span: "md:col-span-2", kind: "demo" as const, tint: "text-violet" },
  { to: "/studio", icon: Mic, title: "Interview Studio", body: "Real microphone input with a reactive waveform.", span: "", kind: "live" as const, tint: "text-cyan" },
  { to: "/templates", icon: LayoutGrid, title: "Template Gallery", body: "Select, inspect and copy Design OS tokens.", span: "", kind: "live" as const, tint: "text-lime" },
  { to: "/settings", icon: Settings2, title: "System Settings", body: "Accent, performance, motion and opt-in sound — persisted.", span: "md:col-span-2", kind: "live" as const, tint: "text-pink" },
] as const;

function Index() {
  const { reducedMotion } = usePrefs();
  return (
    <>
      <section className="flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center gap-8 py-16 text-center">
        <motion.div initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
          <Orb size={104} />
        </motion.div>
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Design OS 3.0</p>
          <motion.h1
            initial={reducedMotion ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.1 }}
            className="text-balance text-5xl font-extrabold leading-[0.95] sm:text-7xl lg:text-8xl"
          >
            Intelligence, <span className="text-neon">in motion.</span>
          </motion.h1>
        </div>
        <motion.div className="w-full" initial={reducedMotion ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.2 }}>
          <Composer />
        </motion.div>
      </section>

      <section aria-labelledby="features" className="py-12">
        <Reveal>
          <h2 id="features" className="mb-8 flex items-center gap-3 text-3xl font-bold sm:text-4xl">
            <Sparkles className="h-7 w-7 text-primary" /> The workspace
          </h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.to} delay={i * 0.06} className={f.span}>
              <Link to={f.to} className="glass group flex h-full min-h-48 flex-col justify-between rounded-3xl p-6 transition hover:-translate-y-1 hover:border-primary/50">
                <div className="flex items-start justify-between">
                  <f.icon className={`h-8 w-8 ${f.tint}`} />
                  <StatusBadge kind={f.kind} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </Link>
            </Reveal>
          ))}
          <Reveal className="md:col-span-3">
            <div className="glass flex flex-col items-start gap-3 rounded-3xl p-6 sm:flex-row sm:items-center">
              <Waves className="h-8 w-8 text-cyan" />
              <p className="text-sm text-muted-foreground">
                Everything runs in your browser. Preferences and chat history live in local storage — nothing is sent to a server.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
