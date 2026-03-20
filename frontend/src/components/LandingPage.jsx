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
  Database,
  Layers,
} from "lucide-react";

import Prism from "./ui/Prism";
import BlurText from "./ui/BlurText";
import ShinyText from "./ui/ShinyText";

import StarBorderButton from "./ui/StarBorderButton";
import SplitText from "./ui/SplitText";
import GradientText from "./ui/GradientText";
import LogoLoop from "./ui/LogoLoop";
import { SiReact, SiNodedotjs, SiExpress, SiTailwindcss, SiFramer } from "react-icons/si";

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

const techLogos = [
  { node: <SiReact />, title: "React 19" },
  { node: <Zap />, title: "Vite 6" },
  { node: <SiNodedotjs />, title: "Node.js" },
  { node: <SiExpress />, title: "Express" },
  { node: <Brain />, title: "Groq LLM" },
  { node: <Database />, title: "Vectorize Hindsight" },
  { node: <SiTailwindcss />, title: "Tailwind CSS v4" },
  { node: <SiFramer />, title: "Framer Motion" },
  { node: <Layers />, title: "OGL WebGL" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

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
      className="group relative flex flex-col justify-center overflow-hidden rounded-[2.5rem] border border-white/[0.12] bg-[#0c0c14]/80 p-10 md:p-14 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.25] min-h-[320px]"
      style={{
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
          : "perspective(800px) rotateX(0) rotateY(0) scale(1)",
        transition: hovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${glowPos.x}% ${glowPos.y}%, ${f.color}18, transparent 60%)`,
        }}
      />
      <div
        className="absolute top-0 left-6 right-6 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${f.color}50, transparent)`,
          opacity: hovered ? 1 : 0.4,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${f.color}12`, border: `1px solid ${f.color}25` }}
        >
          <f.icon className="h-10 w-10" style={{ color: f.color }} />
        </div>
        <div className="min-w-0">
          <h3 className="mb-4 text-2xl font-bold text-white tracking-wide">{f.title}</h3>
          <p className="text-lg leading-relaxed text-slate-400">{f.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030008] text-white font-inter">

      {/* ════════ SECTION 1 — HERO ════════ */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center pt-32 pb-20">

        {/* Background: The 3D Prism Core */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <Prism
            animationType="rotate"
            timeScale={0.3}
            height={3.5}
            baseWidth={6.0}
            scale={3.0}
            hueShift={-0.1}
            colorFrequency={0.8}
            noise={0.3}
            glow={1.2}
            transparent={true}
          />
        </div>

        {/* Vignette Overlay for Readability */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none"
          style={{ background: 'radial-gradient(circle, transparent 20%, #030008 80%)' }}>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl pt-10">

          <div className="mb-8">
            <GradientText
              colors={["#a855f7", "#ef4444", "#f59e0b"]}
              animationSpeed={6}
              className="text-2xl md:text-3xl font-black tracking-widest uppercase"
            >
              TeamTruth
            </GradientText>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8 text-5xl md:text-7xl lg:text-8xl font-extrabold text-white drop-shadow-2xl leading-[1.1] tracking-tighter flex flex-col items-center gap-1"
          >
            <span className="whitespace-nowrap">THE ZERO-TRUST</span>
            <span className="text-center">ACCOUNTABILITY AGENT</span>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-14 mt-12 max-w-2xl px-4 text-center text-lg md:text-xl font-normal leading-relaxed"
            style={{
              color: "#e2e8f0",
              textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)",
            }}
          >
            Existing tools track tasks.{" "}
            <span className="font-semibold text-white">We track the truth.</span>{" "}
            Catch broken promises and predict group project failures{" "}
            <span className="font-semibold text-red-400">before they happen.</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="relative z-20 mt-8 mb-4"
          >
            <StarBorderButton 
              onClick={() => navigate('/chat')}
              color="#ef4444" 
              speed="3s" 
              className="text-lg md:text-xl font-bold tracking-wide px-12 md:px-14 py-4 md:py-5 leading-none"
            >
              <span className="relative z-10 flex items-center gap-3 whitespace-nowrap">
                Initialize Demo
                <ArrowRight className="h-5 w-5" />
              </span>
            </StarBorderButton>
          </motion.div>

        </div>
      </section>

      {/* ════════ SECTION 2 — HERO FEATURES ════════ */}
      <section className="relative z-10 flex flex-col items-center px-6 pb-40 pt-20 bg-[#030008] border-t border-white/5">
        <div className="w-full max-w-7xl grid grid-cols-1 gap-12 lg:grid-cols-2">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ════════ SECTION 3 — TECH STACK ════════ */}
      <section className="relative z-10 flex flex-col items-center pb-28 pt-10 bg-[#030008] border-t border-white/5 overflow-hidden w-full">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-col items-center w-full"
        >
          <p className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase mb-8">Built With</p>
          <LogoLoop
             logos={techLogos}
             speed={100}
             direction="left"
             logoHeight={60}
             gap={80}
             scaleOnHover={true}
             fadeOut={true}
             fadeOutColor="#030008"
             ariaLabel="Technology stack"
           />
        </motion.div>
      </section>

    </div>
  );
}