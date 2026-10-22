import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Accent = "lime" | "cyan" | "violet" | "pink";
export type Perf = "auto" | "high" | "low";
export type MotionPref = "system" | "full" | "reduced";

export interface Prefs {
  accent: Accent;
  performance: Perf;
  motion: MotionPref;
  sound: boolean;
  volume: number; // 0..1
}

export const DEFAULT_PREFS: Prefs = { accent: "lime", performance: "auto", motion: "system", sound: false, volume: 0.4 };
const KEY = "artyverse.prefs.v3";

export function parsePrefs(raw: string | null): Prefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const p = JSON.parse(raw);
    return {
      accent: ["lime", "cyan", "violet", "pink"].includes(p.accent) ? p.accent : DEFAULT_PREFS.accent,
      performance: ["auto", "high", "low"].includes(p.performance) ? p.performance : DEFAULT_PREFS.performance,
      motion: ["system", "full", "reduced"].includes(p.motion) ? p.motion : DEFAULT_PREFS.motion,
      sound: typeof p.sound === "boolean" ? p.sound : DEFAULT_PREFS.sound,
      volume: typeof p.volume === "number" ? Math.min(1, Math.max(0, p.volume)) : DEFAULT_PREFS.volume,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

interface Ctx {
  prefs: Prefs;
  set: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void;
  reset: () => void;
  reducedMotion: boolean;
  lowPower: boolean;
}

const PrefsCtx = createContext<Ctx | null>(null);

function detectLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.hardwareConcurrency ?? 8) <= 4 || (n.deviceMemory ?? 8) <= 4 || !!n.connection?.saveData;
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [sysReduced, setSysReduced] = useState(false);
  const [autoLow, setAutoLow] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { setPrefs(parsePrefs(localStorage.getItem(KEY))); } catch { /* storage blocked */ }
    setLoaded(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSysReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setSysReduced(e.matches);
    mq.addEventListener("change", on);
    setAutoLow(detectLowPower());
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* quota */ }
  }, [prefs, loaded]);

  const reducedMotion = prefs.motion === "reduced" || (prefs.motion === "system" && sysReduced);
  const lowPower = prefs.performance === "low" || (prefs.performance === "auto" && autoLow);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset["accent"] = prefs.accent;
    el.dataset["motion"] = reducedMotion ? "reduced" : "full";
    el.dataset["perf"] = lowPower ? "low" : "high";
  }, [prefs.accent, reducedMotion, lowPower]);

  const set = useCallback(<K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v })), []);
  const reset = useCallback(() => setPrefs(DEFAULT_PREFS), []);

  return <PrefsCtx.Provider value={{ prefs, set, reset, reducedMotion, lowPower }}>{children}</PrefsCtx.Provider>;
}

export function usePrefs() {
  const c = useContext(PrefsCtx);
  // Fallback instead of throwing: keeps pages (and HMR/error boundaries) from blanking
  // if a consumer ever renders outside PrefsProvider.
  if (!c) {
    return { prefs: DEFAULT_PREFS, set: () => {}, reset: () => {}, reducedMotion: false, lowPower: false } as const;
  }
  return c;
}
