import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePrefs } from "@/lib/prefs";
import { playTone } from "@/lib/audio";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/chat", label: "Chat" },
  { to: "/studio", label: "Interview Studio" },
  { to: "/templates", label: "Templates" },
  { to: "/settings", label: "Settings" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
      <span className="h-6 w-6 rounded-full bg-neon shadow-glow" aria-hidden />
      ARTYVERSE<span className="text-primary">X</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { prefs } = usePrefs();
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);

  const linkCls = "rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";
  const active = { className: "rounded-full px-4 py-2 text-sm bg-secondary text-foreground" };

  return (
    <header className="sticky top-0 z-40">
      <div className="glass mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full px-4 py-2 sm:mx-4 lg:mx-auto">
        <Logo />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className={linkCls} activeProps={active} activeOptions={{ exact: true }}
                  onClick={() => playTone("tap", prefs.sound, prefs.volume)}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className="rounded-full p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass mx-3 mt-2 rounded-3xl p-3 md:hidden"
          >
            <ul className="flex flex-col">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
                    className="block rounded-2xl px-4 py-3 font-display text-lg" activeProps={{ className: "block rounded-2xl px-4 py-3 font-display text-lg bg-secondary text-primary" }}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">Design OS 3.0 — a local-first creative workspace.</p>
        </div>
        <div>
          <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Workspace</h2>
          <ul className="space-y-1 text-sm">
            <li><Link to="/chat" className="hover:text-primary">Chat</Link></li>
            <li><Link to="/studio" className="hover:text-primary">Interview Studio</Link></li>
            <li><Link to="/templates" className="hover:text-primary">Templates</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">System</h2>
          <ul className="space-y-1 text-sm">
            <li><Link to="/settings" className="hover:text-primary">Settings</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Status</h2>
          <p className="text-sm text-muted-foreground"><span className="text-cyan">LIVE:</span> mic, waveform, preferences, history. <span className="text-pink">DEMO:</span> AI replies are local mock rules.</p>
        </div>
      </div>
      <p className="pb-6 text-center font-mono text-xs text-muted-foreground">© {new Date().getFullYear()} ARTYVERSE X</p>
    </footer>
  );
}

export function StatusBadge({ kind }: { kind: "live" | "demo" }) {
  return kind === "live" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> Live
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-pink/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-pink">
      <span className="h-1.5 w-1.5 rounded-full bg-pink" /> Demo · local mock
    </span>
  );
}
