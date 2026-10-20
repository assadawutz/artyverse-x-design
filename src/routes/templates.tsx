import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/os/SiteChrome";
import { Reveal, spring } from "@/components/os/motion";
import { usePrefs } from "@/lib/prefs";
import { playTone } from "@/lib/audio";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Design OS Templates — ARTYVERSE X" },
      { name: "description", content: "Select Design OS templates and inspect their tokens." },
      { property: "og:title", content: "Design OS Templates — ARTYVERSE X" },
      { property: "og:description", content: "Selectable template cards with a token inspector." },
    ],
  }),
  component: Templates,
});

const TEMPLATES = [
  { id: "nebula", name: "Nebula Launch", tag: "Landing", colors: ["--violet", "--pink"], font: "Syne 800", radius: "24px", grid: "12 col / 24 gap" },
  { id: "signal", name: "Signal Dashboard", tag: "Dashboard", colors: ["--cyan", "--lime"], font: "DM Sans 500", radius: "16px", grid: "Bento 3×3" },
  { id: "pulse", name: "Pulse Portfolio", tag: "Portfolio", colors: ["--pink", "--cyan"], font: "Syne 700", radius: "32px", grid: "Masonry" },
  { id: "orbit", name: "Orbit Docs", tag: "Docs", colors: ["--lime", "--violet"], font: "JetBrains Mono", radius: "8px", grid: "Sidebar + 8 col" },
  { id: "flux", name: "Flux Commerce", tag: "Store", colors: ["--cyan", "--violet"], font: "DM Sans 700", radius: "20px", grid: "4 col cards" },
  { id: "halo", name: "Halo Event", tag: "Event", colors: ["--lime", "--pink"], font: "Syne 800", radius: "40px", grid: "Full-bleed stack" },
];

function Templates() {
  const [sel, setSel] = useState(TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);
  const { prefs } = usePrefs();
  const t = TEMPLATES.find((x) => x.id === sel)!;
  const tokens = JSON.stringify({ name: t.name, colors: t.colors.map((c) => `var(${c})`), font: t.font, radius: t.radius, grid: t.grid }, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tokens);
      setCopied(true);
      toast.success("Tokens copied");
      playTone("success", prefs.sound, prefs.volume);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Clipboard is blocked in this browser.");
      playTone("error", prefs.sound, prefs.volume);
    }
  };

  return (
    <section aria-labelledby="tpl-h" className="py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 id="tpl-h" className="text-3xl font-bold sm:text-4xl">Design OS templates</h1>
        <StatusBadge kind="live" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div role="radiogroup" aria-label="Templates" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TEMPLATES.map((x, i) => {
            const on = x.id === sel;
            return (
              <Reveal key={x.id} delay={i * 0.04}>
                <button role="radio" aria-checked={on} onClick={() => { setSel(x.id); playTone("tap", prefs.sound, prefs.volume); }}
                  className={`glass w-full rounded-3xl p-3 text-left transition ${on ? "border-primary shadow-glow" : "hover:border-primary/40"}`}>
                  <div className="relative h-32 overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, var(${x.colors[0]}), var(${x.colors[1]}))`, borderRadius: x.radius }}>
                    <div className="absolute inset-3 rounded-xl bg-background/70" />
                    <div className="absolute left-6 top-6 h-2 w-16 rounded-full bg-foreground/80" />
                    <div className="absolute left-6 top-10 h-2 w-24 rounded-full bg-foreground/30" />
                    {on && (
                      <motion.span layoutId="tpl-check" transition={spring} className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </motion.span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="font-display font-bold">{x.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{x.tag}</span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
        <aside aria-label="Inspector" className="glass h-fit rounded-3xl p-5 lg:sticky lg:top-24">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Inspector</p>
          <h2 className="mt-1 text-2xl font-bold">{t.name}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {[["Type", t.tag], ["Font", t.font], ["Radius", t.radius], ["Grid", t.grid]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border pb-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-mono">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-4 flex gap-2">
            {t.colors.map((c) => <span key={c} className="h-8 flex-1 rounded-xl" style={{ background: `var(${c})` }} title={c} />)}
          </div>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-background/70 p-3 font-mono text-xs">{tokens}</pre>
          <button onClick={copy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy tokens"}
          </button>
        </aside>
      </div>
    </section>
  );
}
