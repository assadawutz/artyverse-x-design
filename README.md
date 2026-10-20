# ARTYVERSE X — Design OS 3.0

A cinematic, local-first creative workspace. TanStack Start + React 19 + TypeScript, Tailwind v4, Framer Motion, Lucide, Web Audio API. No backend, no API keys.

## Live vs demo
| Feature | Status |
|---|---|
| Preferences (accent, performance, motion, sound) | **Live** — `localStorage` |
| Chat session history | **Live** — `localStorage` |
| Chat replies | **Demo** — rule-based local mock (`src/lib/mock-ai.ts`), labeled in UI |
| Interview studio mic + waveform | **Live** — `getUserMedia` + `AnalyserNode`, nothing recorded |
| Template gallery + copy tokens | **Live** — Clipboard API |
| UI sound | **Live, opt-in** — oscillator tones |

## Architecture
```text
src/
  routes/
    __root.tsx      shell: PrefsProvider, Atmosphere, header, footer, Toaster
    index.tsx       hero "Intelligence, in motion." + composer (-> /chat?q=) + bento
    chat.tsx        sessions sidebar, mock responder, history
    studio.tsx      mic permission state machine, canvas waveform, timer
    templates.tsx   radiogroup cards + inspector
    settings.tsx    theme / performance / motion / sound
  components/os/
    Atmosphere.tsx  nebula + planet parallax backdrop, Orb mascot
    SiteChrome.tsx  SiteHeader (desktop nav / mobile hamburger), SiteFooter, StatusBadge
    motion.tsx      Reveal (in-view spring), Magnetic (pointer spring), spring preset
  lib/
    prefs.tsx       PrefsProvider: persistence, reduced-motion + low-power detection, html data-attrs
    audio.ts        playTone() — no-op unless sound enabled
    mock-ai.ts      mockReply, session storage helpers
  styles.css        design tokens (oklch), glass/neon utilities, reduced-motion + low-power overrides
```

## Accessibility & performance
- Skip link, semantic landmarks, visible focus rings, ARIA radiogroups/switch/meter.
- Motion: System / Full / Reduced; reduced disables all animation.
- Performance: Auto detects low cores/memory/Save-Data; Low removes blur, glows, parallax and halves waveform frame rate.
- Mic errors: denied, unsupported (non-HTTPS), no device — each has a clear message and retry.

## Tests
`bunx vitest run src/lib/logic.test.ts`
