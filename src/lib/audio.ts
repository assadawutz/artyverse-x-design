// Opt-in UI sound via Web Audio oscillator. Never plays unless the caller passes enabled=true.
let ctx: AudioContext | null = null;

export type Tone = "tap" | "success" | "error" | "send";
const TONES: Record<Tone, [number, number]> = { tap: [660, 0.05], send: [880, 0.09], success: [1040, 0.14], error: [220, 0.18] };

export function playTone(tone: Tone, enabled: boolean, volume = 0.4) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const [freq, dur] = TONES[tone];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone === "error" ? "sawtooth" : "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (tone === "success") osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + dur);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.15 * volume), ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  } catch {
    /* audio unavailable — silently ignore */
  }
}
