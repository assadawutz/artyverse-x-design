import { motion, useScroll, useTransform } from "framer-motion";
import planet from "@/assets/planet.jpg";
import { usePrefs } from "@/lib/prefs";

/** Fixed nebula + planet backdrop with scroll parallax. Static in low-power / reduced motion. */
export function Atmosphere() {
  const { reducedMotion, lowPower } = usePrefs();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1200], [0, 180]);
  const y2 = useTransform(scrollY, [0, 1200], [0, -120]);
  const still = reducedMotion || lowPower;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <motion.img
        src={planet}
        alt=""
        width={1920}
        height={1088}
        style={{ ...(still ? {} : { y }) }}
        className="absolute inset-x-0 top-0 h-[115vh] w-full object-cover opacity-55"
      />
      {!lowPower && (
        <motion.div style={{ ...(still ? {} : { y: y2 }) }} className="absolute inset-0">
          <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-violet/25 blur-3xl" />
          <div className="absolute -right-32 top-1/2 h-[28rem] w-[28rem] rounded-full bg-cyan/15 blur-3xl" />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
    </div>
  );
}

export function Orb({ size = 120, active = false }: { size?: number; active?: boolean }) {
  return (
    <div className="relative animate-orb" style={{ width: size, height: size }} role="img" aria-label="ARTYVERSE AI orb mascot">
      <div className="absolute inset-0 rounded-full bg-neon opacity-60 blur-xl" />
      <div className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(var(--lime),var(--cyan),var(--violet),var(--pink),var(--lime))] p-[2px]">
        <div className="h-full w-full rounded-full bg-background" />
      </div>
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--cyan),var(--violet)_55%,var(--background))]" />
      <div className="absolute left-[34%] top-[42%] flex gap-[14%]" style={{ width: "32%" }}>
        <span className={`block h-2 w-2 rounded-full bg-lime ${active ? "animate-pulse" : ""}`} />
        <span className={`block h-2 w-2 rounded-full bg-lime ${active ? "animate-pulse" : ""}`} />
      </div>
    </div>
  );
}
