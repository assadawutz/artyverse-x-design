// LOCAL MOCK ONLY. No network call, no model. Deterministic templated replies.
export interface ChatMessage { id: string; role: "user" | "assistant"; text: string; at: number; mock?: boolean }
export interface Session { id: string; title: string; messages: ChatMessage[]; updatedAt: number }

const RULES: [RegExp, (q: string) => string][] = [
  [/\b(color|palette|colour)\b/i, () => "Suggested palette (mock): Noir #05070D base, Lime #B6FF39 for primary actions, Cyan #35E5FF for focus/info, Violet #A855F7 for depth, Pink #FF3FD2 for rare highlights. Keep neon under 10% of surface area."],
  [/\b(font|type|typography)\b/i, () => "Type pairing (mock): Syne for display headlines, DM Sans for body at 16–18px, JetBrains Mono for data, labels and code."],
  [/\b(landing|hero|page)\b/i, () => "Hero outline (mock):\n1. One sentence headline\n2. A single primary action\n3. Proof row (logos or metrics)\n4. Bento of 4–6 capabilities\nAvoid repeating the CTA at the bottom."],
  [/\b(interview|question)\b/i, () => "Practice question (mock): 'Tell me about a design decision you reversed after user feedback.' Answer with context → decision → evidence → outcome."],
];

export function mockReply(input: string): string {
  const q = input.trim();
  if (!q) return "Type something and I'll echo back a structured mock response.";
  for (const [re, fn] of RULES) if (re.test(q)) return fn(q);
  const words = q.split(/\s+/).length;
  return `Mock analysis of your ${words}-word prompt:\n• Intent: "${q.slice(0, 80)}${q.length > 80 ? "…" : ""}"\n• Next step: break it into one concrete deliverable.\n• Note: this reply is generated locally by rules — no AI model is connected.`;
}

export function titleFrom(text: string) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 40 ? t.slice(0, 40) + "…" : t || "Untitled";
}

const KEY = "artyverse.sessions.v3";
export function loadSessions(): Session[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}
export function saveSessions(s: Session[]) {
  try { localStorage.setItem(KEY, JSON.stringify(s.slice(0, 30))); } catch { /* ignore */ }
}
export const uid = () => Math.random().toString(36).slice(2, 10);
