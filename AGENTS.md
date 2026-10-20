<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- All persistence is browser localStorage via `src/lib/prefs.tsx` and `src/lib/mock-ai.ts`; no backend exists, so keep it local-first.
- AI replies are a local mock and must stay visibly labeled "Demo/Mock" until a real model is wired in — users must not be misled.
- Global prefs apply via `data-accent`/`data-motion`/`data-perf` on `<html>`; style variants hang off those attributes in `src/styles.css`.
- Sound must go through `playTone(tone, prefs.sound, prefs.volume)` so it stays opt-in.
