import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Volume2 } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/os/SiteChrome";
import { usePrefs, type Accent, type MotionPref, type Perf } from "@/lib/prefs";
import { playTone } from "@/lib/audio";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ARTYVERSE X" },
      { name: "description", content: "Theme accent, performance, motion and sound preferences." },
      { property: "og:title", content: "Settings — ARTYVERSE X" },
      { property: "og:description", content: "Persistent theme, performance, motion and sound preferences." },
    ],
  }),
  component: Settings,
});

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-full bg-secondary p-1">
        {options.map((o) => (
          <label key={o.v} className={`cursor-pointer rounded-full px-4 py-1.5 text-sm transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${value === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <input type="radio" className="sr-only" name={label} checked={value === o.v} onChange={() => onChange(o.v)} />
            {o.l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-bold">{title}</h2><p className="text-sm text-muted-foreground">{desc}</p></div>
      {children}
    </div>
  );
}

const ACCENTS: { v: Accent; cls: string }[] = [
  { v: "lime", cls: "bg-lime" }, { v: "cyan", cls: "bg-cyan" }, { v: "violet", cls: "bg-violet" }, { v: "pink", cls: "bg-pink" },
];

function Settings() {
  const { prefs, set, reset, reducedMotion, lowPower } = usePrefs();
  return (
    <section aria-labelledby="set-h" className="py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 id="set-h" className="text-3xl font-bold sm:text-4xl">Settings</h1>
        <StatusBadge kind="live" />
      </div>
      <div className="glass rounded-3xl px-5 sm:px-8">
        <Row title="Theme accent" desc="Primary neon used for actions and focus rings.">
          <div role="radiogroup" aria-label="Accent" className="flex gap-3">
            {ACCENTS.map((a) => (
              <button key={a.v} role="radio" aria-checked={prefs.accent === a.v} aria-label={a.v}
                onClick={() => { set("accent", a.v); playTone("tap", prefs.sound, prefs.volume); }}
                className={`h-9 w-9 rounded-full ${a.cls} transition ${prefs.accent === a.v ? "ring-2 ring-foreground ring-offset-4 ring-offset-background" : "opacity-60 hover:opacity-100"}`} />
            ))}
          </div>
        </Row>
        <Row title="Performance" desc={`Low disables blur, glows and parallax. Currently: ${lowPower ? "low-power" : "full"}.`}>
          <Segmented<Perf> label="Performance" value={prefs.performance} onChange={(v) => set("performance", v)}
            options={[{ v: "auto", l: "Auto" }, { v: "high", l: "High" }, { v: "low", l: "Low" }]} />
        </Row>
        <Row title="Motion" desc={`System follows your OS setting. Currently: ${reducedMotion ? "reduced" : "full"}.`}>
          <Segmented<MotionPref> label="Motion" value={prefs.motion} onChange={(v) => set("motion", v)}
            options={[{ v: "system", l: "System" }, { v: "full", l: "Full" }, { v: "reduced", l: "Reduced" }]} />
        </Row>
        <Row title="Sound feedback" desc="Opt-in interface tones generated in your browser.">
          <div className="flex flex-wrap items-center gap-4">
            <button role="switch" aria-checked={prefs.sound} aria-label="Sound feedback"
              onClick={() => { const n = !prefs.sound; set("sound", n); playTone("success", n, prefs.volume); }}
              className={`relative h-7 w-12 rounded-full transition ${prefs.sound ? "bg-primary" : "bg-secondary"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-foreground transition-all ${prefs.sound ? "left-6" : "left-1"}`} />
            </button>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span className="sr-only">Volume</span>
              <input type="range" min={0} max={1} step={0.05} value={prefs.volume} disabled={!prefs.sound}
                onChange={(e) => set("volume", Number(e.target.value))}
                onPointerUp={() => playTone("tap", prefs.sound, prefs.volume)}
                className="w-28 accent-[var(--primary)] disabled:opacity-40" />
            </label>
          </div>
        </Row>
        <Row title="Reset" desc="Restore defaults. Chat history is kept.">
          <button onClick={() => { reset(); toast.success("Preferences reset"); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary">
            <RotateCcw className="h-4 w-4" /> Reset preferences
          </button>
        </Row>
      </div>
    </section>
  );
}
