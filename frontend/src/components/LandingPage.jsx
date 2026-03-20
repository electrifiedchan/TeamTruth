import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  AlertTriangle,
  GitGraph,
  ArrowRight,
  Zap,
  Eye,
} from "lucide-react";
import BlurText from "./ui/BlurText";
import ShinyText from "./ui/ShinyText";
import ScrollFloat from "./ui/ScrollFloat";
import StarBorderButton from "./ui/StarBorderButton";
import PixelBlast from "./ui/PixelBlast";

/* ── Feature data ─────────────────────────────────── */
const features = [
  {
    icon: Brain,
    title: "Persistent Memory",
    desc: "Every promise, every claim — stored and indexed via Vectorize Hindsight. Nothing is forgotten.",
    color: "#8b5cf6",
  },
  {
    icon: AlertTriangle,
    title: "Contradiction Engine",
    desc: 'Groq-powered LLM cross-references new statements against history. Say "I finished it" when you didn\'t — we\'ll know.',
    color: "#f87171",
  },
  {
    icon: GitGraph,
    title: "Trust Scoring",
    desc: "Real-time reliability scores calculated from delivery history. Below 50%? Task reassignment recommended.",
    color: "#34d399",
  },
  {
    icon: Eye,
    title: "Zero-Trust by Default",
    desc: "No one gets the benefit of the doubt. Every claim requires evidence. Accountability is the feature.",
    color: "#06b6d4",
  },
];

/* ── Reusable animation variants ──────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ── Interactive Feature Card with 3D tilt + glow ── */
function FeatureCard({ feature: f, index: i }) {
  const ref = React.useRef(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = React.useState({ x: 50, y: 50 });
  const [hovered, setHovered] = React.useState(false);

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * -12, y: (x - 0.5) * 12 });
    setGlowPos({ x: x * 100, y: y * 100 });
  }

  function handleMouseLeave() {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  }

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      custom={i}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c0c14]/80 p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.25]"
      style={{
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
          : "perspective(800px) rotateX(0) rotateY(0) scale(1)",
        transition: hovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
      }}
    >
      {/* Cursor-following glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${glowPos.x}% ${glowPos.y}%, ${f.color}18, transparent 60%)`,
        }}
      />
      {/* Colored top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${f.color}50, transparent)`,
          opacity: hovered ? 1 : 0.4,
        }}
      />

      <div className="relative z-10 flex items-start gap-5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${f.color}12`, border: `1px solid ${f.color}25` }}
        >
          <f.icon className="h-7 w-7" style={{ color: f.color }} />
        </div>
        <div className="min-w-0">
          <h3 className="mb-2 text-lg font-bold text-white">{f.title}</h3>
          <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ── PIXEL BLAST BACKGROUND (full-viewport, non-interactive layer) ── */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
        <PixelBlast
          color="#4f46e5"
          variant="circle"
          pixelSize={8}
          speed={0.2}
          patternScale={2}
          patternDensity={0.3}
          enableRipples={true}
          edgeFade={0.4}
          transparent={true}
        />
      </div>

      {/* ════════ SECTION 1 — HERO ════════ */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-28 pb-24 text-center">

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-6 py-2.5 backdrop-blur-md"
        >
          <Zap className="h-4 w-4 text-indigo-400" />
          <ShinyText
            text="Powered by Groq + Vectorize Hindsight"
            color="#818cf8"
            shineColor="#c7d2fe"
            speed={3}
            className="text-xs font-semibold tracking-widest uppercase"
          />
        </motion.div>

        {/* Headline — BlurText entrance */}
        <div className="mb-8">
          <BlurText
            text="Trust No One."
            className="text-6xl font-extrabold leading-tight tracking-tight text-white md:text-8xl justify-center"
            delay={120}
            animateBy="words"
            direction="top"
          />
          <div className="mt-4">
            <BlurText
              text="Verify Everything."
              className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl gradient-text justify-center"
              delay={150}
              animateBy="words"
              direction="bottom"
            />
          </div>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7, ease: "easeOut" }}
          className="mb-14 max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl drop-shadow-md"
        >
          An AI accountability agent for group projects — it monitors claims,
          cross-references memory, and flags broken promises{" "}
          <span className="font-semibold text-red-400">before they sink your deadline</span>.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center gap-5 sm:flex-row"
        >
          <StarBorderButton onClick={() => navigate("/app")}>
            Launch the Agent
            <ArrowRight className="h-4 w-4" />
          </StarBorderButton>
          <span className="text-sm text-slate-500">No sign-up required · Free demo</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
              Scroll
            </span>
            <div className="h-10 w-px bg-gradient-to-b from-slate-500 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════ SECTION 2 — FEATURES (scroll-triggered) ════════ */}
      <section className="relative z-10 flex flex-col items-center px-6 py-32">

        {/* Section heading — explicitly centered */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="text-xs font-bold tracking-[0.2em] text-indigo-400 uppercase mb-5 text-center"
        >
          How It Works
        </motion.p>

        <ScrollFloat
          containerClassName="flex justify-center w-full"
          textClassName="text-4xl md:text-5xl font-bold text-white"
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.03}
        >
          Built for radical transparency
        </ScrollFloat>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-5 max-w-lg text-base text-slate-400 text-center"
        >
          Every claim is tracked, every promise is indexed, every contradiction is flagged.
        </motion.p>

        {/* Feature cards — centered 2×2 grid with tilt + glow */}
        <div className="mt-20 w-full max-w-4xl grid grid-cols-1 gap-7 sm:grid-cols-2">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ════════ SECTION 3 — TECH STACK ════════ */}
      <section className="relative z-10 flex flex-col items-center pb-28 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">Built With</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["React 19", "Vite 6", "Node.js", "Express", "Groq LLM", "Vectorize Hindsight", "Tailwind CSS v4", "Framer Motion"].map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-400 backdrop-blur-sm transition-colors hover:border-indigo-500/20 hover:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  );
}

