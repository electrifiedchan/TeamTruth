import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Database,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Bot,
  Loader2,
  Sparkles,
  RotateCcw,
  Shield,
  MessageSquare,
  Zap,
  Activity,
  ChevronDown,
  Hash,
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowDown,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import SpotlightCard from "./ui/SpotlightCard";
import TrustGauge from "./ui/TrustGauge";
import CountUp from "./ui/CountUp";
import ShinyText from "./ui/ShinyText";
import LaserFlow from "./ui/LaserFlow";
import BlurText from "./ui/BlurText";
import GradientText from "./ui/GradientText";
import { estimateTrustFromText } from "../utils/trustFallback";

/* ═══════════════════════════════════════════
   DESIGN TOKENS — single source of truth
   ═══════════════════════════════════════════ */
const R = {
  shell: "20px",   // outer containers
  card: "16px",    // cards, bubbles
  btn: "12px",     // buttons, inputs
  pill: "9999px",  // badges, dots
};

const SURFACE = {
  panel: "rgba(12,12,20,0.45)",
  card: "rgba(255,255,255,0.025)",
  cardHover: "rgba(255,255,255,0.04)",
  input: "rgba(14,14,24,0.7)",
  inputFocus: "rgba(18,18,30,0.85)",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.10)",
  borderFocus: "rgba(167,139,250,0.35)",
};

const API = "/api";

const quickMessages = [
  { text: "Hey team, I finished the database.", icon: "💬" },
  { text: "The API endpoints are ready for review.", icon: "🔗" },
  { text: "I'll have it done by tomorrow.", icon: "⏰" },
  { text: "Just pushed my changes to main.", icon: "🚀" },
];

const users = ["Bob", "Alice", "Charlie", "Diana"];

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-indigo-400/60"
          animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function PulsingDot({ color = "bg-emerald-400", size = "h-2 w-2" }) {
  return (
    <span className={`relative flex ${size}`}>
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-30`}
      />
      <span className={`relative inline-flex ${size} rounded-full ${color}`} />
    </span>
  );
}

function TrustBadge({ score }) {
  const variant =
    score >= 66 ? "success" : score >= 33 ? "warning" : "danger";

  const styles = {
    success:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger:
      "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const Icon =
    score >= 66 ? TrendingUp : score >= 33 ? Minus : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5
        text-[10px] font-semibold tabular-nums tracking-wide ${styles[variant]}`}
    >
      <Icon className="h-3 w-3" />
      {score}%
    </span>
  );
}

function DeltaBadge({ delta }) {
  if (delta == null || delta === 0) return null;
  const positive = delta > 0;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-[10px] font-bold tabular-nums ${positive ? "text-emerald-400" : "text-red-400"
        }`}
    >
      {positive ? "+" : ""}
      {delta}%
    </motion.span>
  );
}

/* ── Helper to decide bubble style from trust score instead of string matching ── */
function isLowTrust(msg) {
  return msg.trustScore != null && msg.trustScore < 40;
}

function getTrustVariant(score) {
  if (score >= 66) return "success";
  if (score >= 33) return "warning";
  return "danger";
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState("Bob");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [trustScore, setTrustScore] = useState(null);
  const [memories, setMemories] = useState([]);
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const prevTrustScoreRef = useRef(null);

  /* ── Auto-scroll ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Scroll-to-bottom button visibility ── */
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollBtn(
        el.scrollHeight - el.scrollTop - el.clientHeight > 120
      );
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!showUserSelect) return;
    const close = (e) => {
      // Only close if the click target is NOT inside the dropdown
      setShowUserSelect(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showUserSelect]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  /* ── Fetch memories ── */
  const fetchMemories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/memories/${user}`);
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories || []);
        setTrustScore(data.trustScore);
      }
    } catch {
      /* non-critical */
    }
  }, [user]);

  /* ── Seed memory ── */
  async function handleSeed() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/memory/seed`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIsSeeded(true);
        toast.success("Memory seeded — Bob → DB, Alice → Frontend", {
          icon: "🧠",
        });
        await fetchMemories();
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content:
              "Memory initialized. Bob → Database Schema · Alice → React Frontend UI.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      toast.error("Failed to seed memory");
    }
    setIsLoading(false);
  }

  /* ── Clear everything ── */
  async function handleClear() {
    setMessages([]);
    setTrustScore(null);
    setMemories([]);
    setIsSeeded(false);
    prevTrustScoreRef.current = null;
    try {
      await fetch(`${API}/memory/clear`, { method: "POST" });
      toast.success("Memory cleared — fresh start", { icon: "🔄" });
    } catch {
      toast.error("Backend clear failed");
    }
  }

  /* ── Send message ── */
  async function handleSend(e) {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: new Date().toISOString() },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, message: text }),
      });
      const data = await res.json();

      const aiText = data.analysis || data.response || "No response.";

      let trust = data.trustEvaluation;
      if (!trust || typeof trust.trust_score !== "number") {
        trust = estimateTrustFromText(aiText);
      }
      const finalScore = data.trustScore ?? trust.trust_score ?? null;

      const delta =
        finalScore != null && prevTrustScoreRef.current != null
          ? finalScore - prevTrustScoreRef.current
          : null;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiText,
          trustScore: finalScore,
          trustDelta: delta,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (finalScore != null) {
        prevTrustScoreRef.current = finalScore;
        setTrustScore(finalScore);
      }
      await fetchMemories();
    } catch (err) {
      toast.error(err.message || "Analysis failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠ Analysis unavailable — please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    setIsLoading(false);
  }

  /* ── Keyboard shortcut: Ctrl/Cmd + Enter ── */
  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSend(e);
    }
  }

  const infractions = memories.filter(
    (m) =>
      m.metadata?.type === "broken_promise" || m.metadata?.delivered === false
  ).length;

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(10,10,20,0.95)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${SURFACE.border}`,
            color: "#e2e8f0",
            fontSize: "13px",
            borderRadius: R.btn,
            padding: "12px 18px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
          },
        }}
      />

      {/* ═══ SHELL ═══ */}
      <div
        className="flex w-full relative justify-center mx-auto items-end"
        style={{
          position: "fixed",
          inset: 0,
          top: "4rem",
          padding: "1.5rem",
          paddingTop: "0",
          gap: "1.5rem",
          background: "var(--color-prism-bg, #06060e)",
        }}
      >
        {/* ── LASER overlay — viewport-fixed, always draws from top of screen down ── */}
        <div
          className="pointer-events-none laser-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(calc(-50% - 170px))",
            width: "min(850px, 70vw)",
            height: "100vh",
            zIndex: 5,
            mixBlendMode: "screen",
            opacity: 0.95,
          }}
        >
          <LaserFlow
            horizontalBeamOffset={0.0}
            verticalBeamOffset={0.19}
            color="#c4b5fd"
            horizontalSizing={1.9}
            verticalSizing={4.5}
            wispDensity={1.2}
            wispSpeed={14}
            wispIntensity={5}
            flowSpeed={0.38}
            flowStrength={0.28}
            fogIntensity={0.48}
            fogScale={0.28}
            fogFallSpeed={0.65}
            decay={1.15}
            falloffStart={1.4}
          />
        </div>

        {/* Ambient glows */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: "18%",
            left: "28%",
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            bottom: "8%",
            right: "12%",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(139,92,246,0.025) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />


        {/* LEFT: CHAT PANEL */}
        <div className="relative flex w-full max-w-[850px] pb-2" style={{ height: "68vh" }}>

          <div
            className="relative flex flex-col z-10 w-full"
            style={{
              borderRadius: R.shell,
              border: `1px solid ${SURFACE.border}`,
              borderTop: "3px solid rgba(167, 139, 250, 0.8)",
              background: "rgba(10,10,18,0.75)",
              backdropFilter: "blur(32px)",
              boxShadow:
                "0 -32px 100px -20px rgba(167, 139, 250, 0.4), 0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* ── HEADER ── */}
            <header
              className="relative z-20 flex items-center justify-between gap-2 px-3 py-3"
              style={{
                borderBottom: `1px solid ${SURFACE.border}`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
              }}
            >
              {/* Left: Logo + title */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div
                    className="flex h-9 w-9 items-center justify-center"
                    style={{
                      borderRadius: R.btn,
                      background:
                        "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.06) 100%)",
                      border: "1px solid rgba(99,102,241,0.14)",
                    }}
                  >
                    <Shield className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <PulsingDot color="bg-emerald-400" size="h-[6px] w-[6px]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h1 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                    <ShinyText
                      text="TeamTruth"
                      color="#818cf8"
                      shineColor="#c7d2fe"
                      speed={4}
                      className="font-semibold"
                    />
                    <span className="text-white/80 font-normal">Agent</span>
                  </h1>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40 font-medium">
                    <Activity className="h-2.5 w-2.5 text-emerald-500/50" />
                    Zero-Trust Accountability
                  </p>
                </div>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* User selector */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowUserSelect(!showUserSelect)}
                    className="flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold
                    text-white/90 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      borderRadius: R.btn,
                      background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%)",
                      border: "1px solid rgba(129,140,248,0.26)",
                      boxShadow: "0 0 12px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}
                  >
                    <User className="h-3 w-3 text-indigo-300 shrink-0" />
                    <span className="text-indigo-100/90">{user}</span>
                    <ChevronDown
                      className={`h-3 w-3 text-indigo-300/60 transition-transform duration-200 ${showUserSelect ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showUserSelect && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full z-[60] mt-1.5 min-w-[160px] overflow-hidden py-1"
                        style={{
                          borderRadius: R.card,
                          background: "rgba(14,14,28,0.98)",
                          border: `1px solid ${SURFACE.border}`,
                          backdropFilter: "blur(20px)",
                          boxShadow: "0 20px 48px rgba(0,0,0,0.6)",
                        }}
                      >
                        {users.map((u) => (
                          <button
                            key={u}
                            onClick={() => {
                              setUser(u);
                              setShowUserSelect(false);
                            }}
                            className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5
                            text-xs font-medium transition-colors duration-100
                            ${u === user
                                ? "bg-indigo-500/8 text-indigo-300"
                                : "text-white/70 hover:bg-white/[0.04] hover:text-white/90"
                              }`}
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 ${u === user
                                ? "bg-indigo-500/15 border border-indigo-500/25"
                                : "bg-white/[0.04] border border-white/[0.06]"
                                }`}
                            >
                              <User className="h-2.5 w-2.5" />
                            </div>
                            {u}
                            {u === user && (
                              <CheckCircle2 className="ml-auto h-3 w-3 text-indigo-400/60" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  className="h-4 w-px"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />

                {/* Seed */}
                <button
                  onClick={handleSeed}
                  disabled={isSeeded || isLoading}
                  className="flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5
                  text-xs font-semibold transition-all duration-200
                  hover:scale-[1.04] active:scale-[0.96]
                  disabled:pointer-events-none disabled:opacity-30"
                  style={{
                    borderRadius: R.btn,
                    background: isSeeded
                      ? "linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.09) 100%)"
                      : "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%)",
                    border: isSeeded
                      ? "1px solid rgba(52,211,153,0.30)"
                      : "1px solid rgba(129,140,248,0.24)",
                    color: isSeeded
                      ? "rgba(110,231,183,0.95)"
                      : "rgba(199,210,254,0.92)",
                    boxShadow: isSeeded
                      ? "0 0 14px rgba(52,211,153,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                      : "0 0 14px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}
                >
                  {isSeeded ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Database className="h-3.5 w-3.5" />
                  )}
                  {isSeeded ? "Loaded" : "Seed"}
                </button>

                {/* Clear */}
                <button
                  onClick={handleClear}
                  className="flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5
                    text-xs font-semibold transition-all duration-200
                    hover:scale-[1.04] active:scale-[0.96]"
                  style={{
                    borderRadius: R.btn,
                    background: "linear-gradient(135deg, rgba(239,68,68,0.14) 0%, rgba(220,38,38,0.07) 100%)",
                    border: "1px solid rgba(248,113,113,0.26)",
                    color: "rgba(252,165,165,0.92)",
                    boxShadow: "0 0 12px rgba(239,68,68,0.14), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                  title="Reset demo — clears all memory and messages"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            </header>

            {/* ── MESSAGES AREA ── */}
            <div
              ref={chatContainerRef}
              className="relative flex-1 overflow-y-auto scroll-smooth"
              style={{ scrollbarWidth: "none", scrollBehavior: "smooth", paddingBottom: "220px" }}
            >
              {/* Empty state */}
              {messages.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none z-0 pb-40">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="relative flex h-14 w-14 items-center justify-center mb-5"
                      style={{
                        borderRadius: R.card,
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)",
                        border: "1px solid rgba(99,102,241,0.08)",
                      }}
                    >
                      <MessageSquare className="h-6 w-6 text-indigo-400/25" />
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ rotate: [0, 12, -12, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-400/25" />
                      </motion.div>
                    </div>

                    <BlurText
                      text="Start a Conversation"
                      className="text-lg font-semibold text-white/90 mb-2"
                      delay={50}
                      animateBy="words"
                      direction="top"
                    />
                    <p className="text-[13px] text-white/35 max-w-[280px] leading-relaxed">
                      Send a message to analyze accountability.
                      <br />
                      Seed memory first for context.
                    </p>

                    <div className="flex items-center gap-3 mt-6">
                      <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/[0.06]" />
                      <span className="text-[9px] font-semibold tracking-[0.2em] text-white/25 uppercase">
                        Quick prompts
                      </span>
                      <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/[0.06]" />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Central column */}
              <div className="flex w-full justify-center pt-6 relative z-10">
                <div className="w-full max-w-[780px] flex flex-col gap-5 px-5">
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={`${i}-${msg.timestamp}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"
                          }`}
                      >
                        {/* ─── System message ─── */}
                        {msg.role === "system" && (
                          <div
                            className="flex items-center gap-3 w-full px-5 py-3 text-[13px]"
                            style={{
                              borderRadius: R.card,
                              background: "rgba(99,102,241,0.03)",
                              border: "1px solid rgba(99,102,241,0.07)",
                              color: "rgba(165,180,252,0.55)",
                            }}
                          >
                            <div
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                              style={{
                                background: "rgba(99,102,241,0.08)",
                                border: "1px solid rgba(99,102,241,0.12)",
                              }}
                            >
                              <Sparkles className="h-3 w-3 text-indigo-400/50" />
                            </div>
                            <span className="leading-relaxed">{msg.content}</span>
                          </div>
                        )}

                        {/* ─── User bubble ─── */}
                        {msg.role === "user" && (
                          <div className="max-w-[75%] group">
                            {/* Meta line */}
                            <div className="mb-1.5 flex items-center justify-end gap-2 px-1">
                              <span className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tabular-nums">
                                {formatTime(msg.timestamp)}
                              </span>
                              <span className="text-[11px] font-medium text-white/50">
                                {user}
                              </span>
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-full shrink-0"
                                style={{
                                  background:
                                    "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
                                  border: "1px solid rgba(99,102,241,0.18)",
                                }}
                              >
                                <User className="h-2.5 w-2.5 text-indigo-400/60" />
                              </div>
                            </div>

                            {/* Bubble */}
                            <div
                              className="px-5 py-3.5 text-[14px] leading-[1.7]"
                              style={{
                                borderRadius: `${R.card} ${R.card} 6px ${R.card}`,
                                background:
                                  "linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(67,56,202,0.08) 100%)",
                                border: "1px solid rgba(129,140,248,0.12)",
                                color: "rgba(255,255,255,0.92)",
                                boxShadow:
                                  "0 4px 24px rgba(79,70,229,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                                backdropFilter: "blur(16px)",
                              }}
                            >
                              {msg.content}
                            </div>
                          </div>
                        )}

                        {/* ─── Assistant bubble ─── */}
                        {msg.role === "assistant" && (
                          <div className="max-w-[80%] group">
                            {/* Meta line */}
                            <div className="mb-1.5 flex items-center gap-2 px-1 flex-wrap">
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-full shrink-0"
                                style={{
                                  background: isLowTrust(msg)
                                    ? "rgba(248,113,113,0.1)"
                                    : "rgba(139,92,246,0.1)",
                                  border: isLowTrust(msg)
                                    ? "1px solid rgba(248,113,113,0.16)"
                                    : "1px solid rgba(139,92,246,0.14)",
                                }}
                              >
                                <Bot
                                  className={`h-2.5 w-2.5 ${isLowTrust(msg)
                                    ? "text-red-400/60"
                                    : "text-violet-400/60"
                                    }`}
                                />
                              </div>

                              <GradientText
                                colors={["#c7d2fe", "#818cf8", "#c7d2fe"]}
                                animationSpeed={4}
                                className="text-[11px] font-semibold tracking-wide"
                              >
                                TeamTruth
                              </GradientText>

                              {msg.trustScore != null && (
                                <>
                                  <TrustBadge score={msg.trustScore} />
                                  <DeltaBadge delta={msg.trustDelta} />
                                </>
                              )}

                              <span className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tabular-nums">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>

                            {/* Bubble */}
                            <SpotlightCard
                              className="px-5 py-4 text-[14px] leading-[1.75]"
                              spotlightColor={
                                isLowTrust(msg)
                                  ? "rgba(248,113,113,0.12)"
                                  : "rgba(167,139,250,0.12)"
                              }
                              style={{
                                borderRadius: `6px ${R.card} ${R.card} ${R.card}`,
                                background: isLowTrust(msg)
                                  ? "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(153,27,27,0.04) 100%)"
                                  : "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(99,102,241,0.03) 100%)",
                                border: `1px solid ${SURFACE.border}`,
                                color: isLowTrust(msg)
                                  ? "rgba(254,202,202,0.9)"
                                  : "rgba(241,245,249,0.88)",
                                boxShadow: isLowTrust(msg)
                                  ? "0 8px 32px rgba(239,68,68,0.08)"
                                  : "0 8px 32px rgba(139,92,246,0.06)",
                                backdropFilter: "blur(20px)",
                              }}
                            >
                              <div className="whitespace-pre-wrap">
                                {msg.content}
                              </div>
                            </SpotlightCard>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-2.5"
                      >
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full shrink-0"
                          style={{
                            background: "rgba(139,92,246,0.1)",
                            border: "1px solid rgba(139,92,246,0.14)",
                          }}
                        >
                          <Bot className="h-2.5 w-2.5 text-violet-400/60" />
                        </div>
                        <div
                          className="flex items-center gap-2.5 px-4 py-3"
                          style={{
                            borderRadius: R.card,
                            background: SURFACE.card,
                            border: `1px solid ${SURFACE.border}`,
                          }}
                        >
                          <TypingIndicator />
                          <span className="text-xs text-white/35 font-medium">
                            Analyzing…
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Scroll-to-bottom */}
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={scrollToBottom}
                    className="sticky bottom-4 left-1/2 -translate-x-1/2 z-20 flex h-8 w-8
                    cursor-pointer items-center justify-center rounded-full
                    text-white/60 transition-colors hover:text-white/80"
                    style={{
                      background: "rgba(12,12,24,0.9)",
                      border: `1px solid ${SURFACE.border}`,
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    }}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ── FLOATING INPUT ISLAND ── */}
            <div
              className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none
              flex flex-col items-center pb-5 pt-16"
              style={{
                background:
                  "linear-gradient(to top, rgba(8,8,16,0.95) 0%, rgba(8,8,16,0.6) 50%, transparent 100%)",
              }}
            >
              <div className="mx-auto w-full max-w-[780px] pointer-events-auto px-5 flex flex-col gap-2.5">
                {/* Quick prompts */}
                <div
                  className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1
                  [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-24px),transparent)]"
                  style={{ scrollbarWidth: "none" }}
                >
                  {quickMessages.map((qm) => (
                    <button
                      key={qm.text}
                      onClick={() => setInput(qm.text)}
                      className="flex shrink-0 cursor-pointer items-center gap-1.5 px-3.5 py-2
                      text-xs font-medium text-white/50 transition-all duration-150
                      hover:text-white/80 hover:border-white/[0.12] active:scale-[0.97]"
                      style={{
                        borderRadius: R.btn,
                        background: SURFACE.card,
                        border: `1px solid ${SURFACE.border}`,
                      }}
                    >
                      <span className="text-sm">{qm.icon}</span>
                      <span className="max-w-[170px] truncate">{qm.text}</span>
                    </button>
                  ))}
                </div>

                {/* Input bar */}
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-3 px-2 py-2 transition-all duration-300"
                  style={{
                    borderRadius: "18px",
                    background: inputFocused ? SURFACE.inputFocus : SURFACE.input,
                    border: `1px solid ${inputFocused ? SURFACE.borderFocus : SURFACE.border
                      }`,
                    backdropFilter: "blur(40px)",
                    boxShadow: inputFocused
                      ? "0 12px 48px rgba(139,92,246,0.12), 0 0 0 1px rgba(167,139,250,0.08)"
                      : "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message as ${user}…`}
                    disabled={isLoading}
                    className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white/90
                    placeholder-white/25 outline-none disabled:opacity-30"
                  />

                  <AnimatePresence>
                    {input.trim() && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <Zap className="h-3.5 w-3.5 text-indigo-400/30" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center cursor-pointer
                    transition-all duration-200 hover:scale-105 active:scale-95
                    disabled:pointer-events-none disabled:opacity-30"
                    style={{
                      borderRadius: R.btn,
                      background: input.trim()
                        ? "linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)"
                        : "rgba(255,255,255,0.06)",
                      border: input.trim()
                        ? "1px solid rgba(255,255,255,0.15)"
                        : `1px solid ${SURFACE.border}`,
                      boxShadow: input.trim()
                        ? "0 4px 16px rgba(139,92,246,0.3)"
                        : "none",
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                    ) : (
                      <Send className="h-4 w-4 text-white/90" />
                    )}
                  </button>
                </form>

                {/* Disclaimer */}
                <p className="text-center text-[10px] text-white/20 font-medium tracking-wide px-4">
                  Agent may produce inaccurate assessments · Verify critical
                  details ·{" "}
                  <span className="text-white/30">⌘+Enter</span> to send
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────
            RIGHT: TRUST DASHBOARD
            ────────────────────────────────────── */}
        <aside
          className="hidden w-[340px] flex-col overflow-hidden lg:flex relative z-10 pb-2"
          style={{
            height: "68vh",
            borderRadius: R.shell,
            border: `1px solid ${SURFACE.border}`,
            background: "rgba(10,10,18,0.45)",
            backdropFilter: "blur(32px)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Sidebar header */}
          <div
            className="flex items-center gap-3 px-5 py-3.5 shrink-0"
            style={{
              borderBottom: `1px solid ${SURFACE.border}`,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
            }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center shrink-0"
              style={{
                borderRadius: "10px",
                background:
                  "linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(16,185,129,0.04) 100%)",
                border: "1px solid rgba(52,211,153,0.12)",
              }}
            >
              <Shield className="h-3 w-3 text-emerald-400/60" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-white/75 tracking-tight">
                Trust Engine
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PulsingDot color="bg-emerald-400" size="h-1 w-1" />
                <span className="text-[9px] text-white/35 font-medium">
                  Real-time monitoring
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar body */}
          <div
            className="flex-1 overflow-y-auto space-y-4 p-4"
            style={{ scrollbarWidth: "none" }}
          >
            {/* ── Trust Gauge Card ── */}
            <SpotlightCard
              className="flex flex-col items-center p-6"
              style={{
                borderRadius: R.card,
                background: SURFACE.card,
                border: `1px solid ${SURFACE.border}`,
              }}
              spotlightColor={
                trustScore == null
                  ? "rgba(99,102,241,0.1)"
                  : trustScore >= 66
                    ? "rgba(52,211,153,0.1)"
                    : trustScore >= 33
                      ? "rgba(251,191,36,0.1)"
                      : "rgba(248,113,113,0.1)"
              }
            >
              <h3 className="mb-4 text-[8px] font-bold tracking-[0.2em] text-white/35 uppercase">
                {user}'s Trust Score
              </h3>

              {trustScore != null ? (
                <>
                  <TrustGauge score={trustScore} />
                  <div className="mt-4 flex items-baseline gap-0.5">
                    <CountUp
                      to={trustScore}
                      from={0}
                      duration={1.5}
                      className={`text-3xl font-bold tracking-tight tabular-nums ${trustScore >= 66
                        ? "text-emerald-400"
                        : trustScore >= 33
                          ? "text-amber-400"
                          : "text-red-400"
                        }`}
                    />
                    <span className="text-sm font-medium text-white/40">%</span>
                  </div>
                  <p className="mt-2 text-[10px] text-white/30 font-medium">
                    {trustScore >= 66
                      ? "Reliable contributor"
                      : trustScore >= 33
                        ? "Needs attention"
                        : "High risk individual"}
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mb-3 flex h-10 w-10 items-center justify-center"
                    style={{
                      borderRadius: R.btn,
                      background: SURFACE.card,
                      border: `1px solid ${SURFACE.border}`,
                    }}
                  >
                    <Clock className="h-4 w-4 text-white/20" />
                  </motion.div>
                  <p className="text-[11px] text-white/25">
                    Awaiting first interaction…
                  </p>
                </div>
              )}
            </SpotlightCard>

            {/* ── Stats Grid ── */}
            <AnimatePresence>
              {trustScore != null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <SpotlightCard
                    className="flex flex-col items-center p-4"
                    style={{
                      borderRadius: R.card,
                      background: SURFACE.card,
                      border: `1px solid ${SURFACE.border}`,
                    }}
                    spotlightColor="rgba(99,102,241,0.1)"
                  >
                    <Database className="h-3.5 w-3.5 text-indigo-400/35 mb-2" />
                    <CountUp
                      to={memories.length}
                      from={0}
                      duration={1}
                      className="text-xl font-bold text-white/80 tabular-nums"
                    />
                    <p className="mt-1 text-[8px] font-bold tracking-[0.15em] text-white/30 uppercase">
                      Memories
                    </p>
                  </SpotlightCard>

                  <SpotlightCard
                    className="flex flex-col items-center p-4"
                    style={{
                      borderRadius: R.card,
                      background: SURFACE.card,
                      border: `1px solid ${SURFACE.border}`,
                    }}
                    spotlightColor="rgba(248,113,113,0.1)"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400/30 mb-2" />
                    <CountUp
                      to={infractions}
                      from={0}
                      duration={1}
                      className="text-xl font-bold text-white/70 tabular-nums"
                    />
                    <p className="mt-1 text-[8px] font-bold tracking-[0.15em] text-white/30 uppercase">
                      Infractions
                    </p>
                  </SpotlightCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Memory Log ── */}
            <AnimatePresence>
              {memories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between px-0.5">
                    <h3 className="text-[8px] font-bold tracking-[0.2em] text-white/35 uppercase">
                      Memory Log
                    </h3>
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px]
                        text-white/30 font-medium tabular-nums"
                      style={{
                        borderRadius: R.pill,
                        background: SURFACE.card,
                        border: `1px solid ${SURFACE.border}`,
                      }}
                    >
                      <Hash className="h-2.5 w-2.5" />
                      {memories.length}
                    </span>
                  </div>

                  <div
                    className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {memories.slice(0, 15).map((m, i) => {
                      const isBroken =
                        m.metadata?.type === "broken_promise" ||
                        m.metadata?.delivered === false;
                      const isAnalysis = m.metadata?.type === "ai_analysis";

                      return (
                        <motion.div
                          key={`mem-${i}`}
                          initial={{ opacity: 0, x: 4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.025, duration: 0.2 }}
                          className="px-3 py-2.5 text-[11px] leading-relaxed
                            transition-colors duration-150 hover:bg-white/[0.015]"
                          style={{
                            borderRadius: R.btn,
                            background: isBroken
                              ? "rgba(248,113,113,0.03)"
                              : isAnalysis
                                ? "rgba(99,102,241,0.03)"
                                : "rgba(255,255,255,0.015)",
                            border: `1px solid ${isBroken
                              ? "rgba(248,113,113,0.08)"
                              : isAnalysis
                                ? "rgba(99,102,241,0.08)"
                                : SURFACE.border
                              }`,
                            color: isBroken
                              ? "rgba(254,202,202,0.6)"
                              : isAnalysis
                                ? "rgba(199,210,254,0.5)"
                                : "rgba(148,163,184,0.45)",
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            {isBroken ? (
                              <AlertTriangle className="h-2.5 w-2.5 text-red-400/40 shrink-0" />
                            ) : isAnalysis ? (
                              <Bot className="h-2.5 w-2.5 text-indigo-400/40 shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-2.5 w-2.5 text-white/20 shrink-0" />
                            )}
                            <span className="font-bold uppercase tracking-[0.1em] text-[7px] text-white/25">
                              {m.metadata?.type?.replace(/_/g, " ") || "record"}
                            </span>
                          </div>
                          <p className="line-clamp-2">{m.content}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </>
  );
}
