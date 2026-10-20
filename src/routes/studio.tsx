import { createFileRoute } from "@tanstack/react-router";
import { Mic, MicOff, RefreshCw, Timer } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/os/SiteChrome";
import { usePrefs } from "@/lib/prefs";
import { playTone } from "@/lib/audio";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Interview Studio — ARTYVERSE X" },
      { name: "description", content: "Practice interviews with live microphone input and a reactive waveform." },
      { property: "og:title", content: "Interview Studio — ARTYVERSE X" },
      { property: "og:description", content: "Live microphone waveform for interview practice." },
    ],
  }),
  component: Studio,
});

const QUESTIONS = [
  "Walk me through a project you're proud of.",
  "Describe a design decision you reversed after feedback.",
  "How do you balance aesthetics with accessibility?",
  "Tell me about a time you disagreed with a stakeholder.",
  "How would you design onboarding for a creative tool?",
];

type MicState = "idle" | "requesting" | "live" | "denied" | "unsupported" | "error";

function Studio() {
  const { prefs, lowPower } = usePrefs();
  const [state, setState] = useState<MicState>("idle");
  const [qi, setQi] = useState(0);
  const [secs, setSecs] = useState(0);
  const [level, setLevel] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    if (state !== "live") return;
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setState("unsupported"); return; }
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      const ac = new AudioContext();
      ctxRef.current = ac;
      const analyser = ac.createAnalyser();
      analyser.fftSize = lowPower ? 256 : 1024;
      ac.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      setSecs(0);
      setState("live");
      playTone("success", prefs.sound, prefs.volume);
      let frame = 0;
      const draw = () => {
        rafRef.current = requestAnimationFrame(draw);
        if (lowPower && frame++ % 2) return;
        analyser.getByteTimeDomainData(data);
        const c = canvasRef.current;
        if (!c) return;
        const g = c.getContext("2d");
        if (!g) return;
        const w = (c.width = c.clientWidth * (lowPower ? 1 : devicePixelRatio));
        const h = (c.height = c.clientHeight * (lowPower ? 1 : devicePixelRatio));
        g.clearRect(0, 0, w, h);
        const css = getComputedStyle(document.documentElement);
        const grad = g.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, css.getPropertyValue("--lime"));
        grad.addColorStop(0.5, css.getPropertyValue("--cyan"));
        grad.addColorStop(1, css.getPropertyValue("--pink"));
        g.strokeStyle = grad;
        g.lineWidth = 3 * (lowPower ? 1 : devicePixelRatio);
        g.beginPath();
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
          const x = (i / (data.length - 1)) * w;
          const y = h / 2 + v * h * 0.45;
          if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
      };
      draw();
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === "NotAllowedError" || name === "SecurityError") setState("denied");
      else { setState("error"); toast.error(name === "NotFoundError" ? "No microphone found." : "Couldn't start the microphone."); }
      playTone("error", prefs.sound, prefs.volume);
    }
  };

  const end = () => { stop(); setState("idle"); };
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <section aria-labelledby="studio-h" className="py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 id="studio-h" className="text-3xl font-bold sm:text-4xl">Interview studio</h1>
        <StatusBadge kind="live" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="glass rounded-3xl p-5 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Question {qi + 1} / {QUESTIONS.length}</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{QUESTIONS[qi]}</h2>
          <div className="relative mt-6 h-40 overflow-hidden rounded-2xl border border-border bg-background/60">
            <canvas ref={canvasRef} className="h-full w-full" aria-label="Live audio waveform" role="img" />
            {state !== "live" && (
              <div className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-muted-foreground">
                {state === "idle" && "Start the mic to see your voice as a waveform. Audio never leaves your device."}
                {state === "requesting" && "Waiting for microphone permission…"}
                {state === "denied" && <span className="text-destructive">Microphone access was blocked. Allow it in your browser's site settings, then try again.</span>}
                {state === "unsupported" && "This browser doesn't support microphone access (it may require HTTPS)."}
                {state === "error" && "Microphone couldn't start. Check that one is connected."}
              </div>
            )}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary" role="meter" aria-label="Input level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
            <div className="h-full bg-neon transition-[width] duration-75" style={{ width: `${level * 100}%` }} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {state === "live" ? (
              <button onClick={end} className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-medium text-destructive-foreground">
                <MicOff className="h-4 w-4" /> Stop mic
              </button>
            ) : (
              <button onClick={start} disabled={state === "requesting"} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
                <Mic className="h-4 w-4" /> {state === "denied" || state === "error" ? "Try again" : "Start mic"}
              </button>
            )}
            <button onClick={() => { setQi((i) => (i + 1) % QUESTIONS.length); setSecs(0); playTone("tap", prefs.sound, prefs.volume); }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm">
              <RefreshCw className="h-4 w-4" /> Next question
            </button>
          </div>
        </div>
        <aside className="glass space-y-4 rounded-3xl p-5" aria-label="Session info">
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-cyan" />
            <span className="font-mono text-3xl tabular-nums">{mm}:{ss}</span>
          </div>
          <p className="text-sm text-muted-foreground">Aim for 60–120 seconds. Structure: context → action → result.</p>
          <p className="text-xs text-muted-foreground">Nothing is recorded or uploaded. Transcription and AI feedback are not available in this build.</p>
        </aside>
      </div>
    </section>
  );
}
