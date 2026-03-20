import { useState, useRef, useEffect } from "react";
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
  Eye,
  ChevronDown,
  Hash,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import SpotlightCard from "./ui/SpotlightCard";
import TrustGauge from "./ui/TrustGauge";
import CountUp from "./ui/CountUp";
import ShinyText from "./ui/ShinyText";
import PixelBlast from "./ui/PixelBlast";
import BlurText from "./ui/BlurText";
import StarBorderButton from "./ui/StarBorderButton";
import GradientText from "./ui/GradientText";
import { estimateTrustFromText } from "../utils/trustFallback";

const API = "/api";

const quickMessages = [
  { text: "Hey team, I finished the database.", icon: "💬" },
  { text: "The API endpoints are ready for review.", icon: "🔗" },
  { text: "I'll have it done by tomorrow.", icon: "⏰" },
  { text: "Just pushed my changes to main.", icon: "🚀" },
];

const users = ["Bob", "Alice", "Charlie", "Diana"];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-indigo-400/70"
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

function GlowBadge({ children, variant = "default" }) {
  const styles = {
    success:
      "bg-emerald-500/8 text-emerald-400 border-emerald-500/15 shadow-[0_0_8px_rgba(52,211,153,0.06)]",
    warning:
      "bg-amber-500/8 text-amber-400 border-amber-500/15 shadow-[0_0_8px_rgba(251,191,36,0.06)]",
    danger:
      "bg-red-500/8 text-red-400 border-red-500/15 shadow-[0_0_8px_rgba(248,113,113,0.06)]",
    default:
      "bg-indigo-500/8 text-indigo-400 border-indigo-500/15 shadow-[0_0_8px_rgba(99,102,241,0.06)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function TrustTrend({ score }) {
  if (score >= 66) return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (score >= 33) return <Minus className="h-3 w-3 text-amber-400" />;
  return <TrendingDown className="h-3 w-3 text-red-400" />;
}

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showUserSelect) return;
    const close = () => setShowUserSelect(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showUserSelect]);

  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchMemories() {
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
  }

  async function handleSeed() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/memory/seed`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIsSeeded(true);
        toast.success("Memory seeded! Bob → DB, Alice → Frontend.", { icon: "🧠" });
        await fetchMemories();
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content:
              "Memory initialized. Bob is assigned the Database Schema. Alice is assigned the React Frontend UI.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      toast.error("Failed to seed memory");
    }
    setIsLoading(false);
  }

  async function handleClear() {
    setMessages([]);
    setTrustScore(null);
    setMemories([]);
    setIsSeeded(false);
    try {
      await fetch(`${API}/memory/clear`, { method: "POST" });
      toast.success("Demo reset! Memory context cleared.", { icon: "🔄" });
    } catch {
      toast.error("Failed to clear backend context");
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, message: userMessage }),
      });
      const data = await res.json();
      console.log("Backend response:", data);

      // Prefer the new structured response, fall back to legacy 'response' field
      const aiText = data.analysis || data.response || "No response.";

      // Get trust from structured eval, then legacy field, then frontend fallback
      let trust = data.trustEvaluation;
      if (!trust || typeof trust.trust_score !== "number") {
        trust = estimateTrustFromText(aiText);
      }
      const finalScore = data.trustScore ?? trust.trust_score ?? null;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiText,
          trustScore: finalScore,
          timestamp: new Date().toISOString(),
        },
      ]);
      if (finalScore !== null) setTrustScore(finalScore);
      await fetchMemories();
    } catch (err) {
      toast.error(err.message || "Failed to analyze message");
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

  function handleReset() {
    setMessages([]);
    setTrustScore(null);
    setMemories([]);
    setIsSeeded(false);
    toast("Chat reset successfully", { icon: "🔄" });
  }

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function getTrustVariant(score) {
    if (score >= 66) return "success";
    if (score >= 33) return "warning";
    return "danger";
  }

  const infractions = memories.filter(
    (m) =>
      m.metadata?.type === "broken_promise" || m.metadata?.delivered === false
  ).length;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(10,10,20,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#e2e8f0",
            fontSize: "13px",
            borderRadius: "12px",
            padding: "12px 18px",
            boxShadow:
              "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)",
          },
        }}
      />

      {/* ═══ OUTER SHELL ═══ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          top: "5rem",
          padding: "1.5rem",
          display: "flex",
          gap: "1rem",
          background: "var(--color-prism-bg, #06060e)",
        }}
      >
        {/* ReactBits Dynamic Background */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-20 delay-500 transition-opacity duration-1000">
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
        {/* Subtle ambient glow behind everything */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "15%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.025) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(80px)",
          }}
        />

        {/* ───── LEFT: CHAT PANEL ───── */}
        <div
          className="relative flex flex-1 flex-col overflow-hidden"
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.05)",
            background:
              "linear-gradient(180deg, rgba(12,12,24,0.95) 0%, rgba(8,8,16,0.98) 100%)",
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.05),
              0 1px 2px rgba(0,0,0,0.3),
              0 4px 8px rgba(0,0,0,0.2),
              0 16px 32px rgba(0,0,0,0.25),
              0 32px 64px rgba(0,0,0,0.15),
              inset 0 1px 0 rgba(255,255,255,0.07)
            `,
          }}
        >
          {/* ── Header ── */}
          <div
            className="relative flex items-center justify-between px-6 py-3.5"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.09)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
                  }}
                >
                  <Shield className="h-[18px] w-[18px] text-indigo-400" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5">
                  <PulsingDot color="bg-emerald-400" size="h-[7px] w-[7px]" />
                </div>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white/90 tracking-[-0.01em] flex items-center gap-1.5">
                  <ShinyText
                    text="TeamTruth"
                    color="#818cf8"
                    shineColor="#c7d2fe"
                    speed={4}
                    className="font-semibold"
                  />
                  <span className="text-white/90 font-normal">Agent</span>
                </h2>
                <p className="text-[11px] text-white/70 mt-0.5 flex items-center gap-1.5 font-medium">
                  <Activity className="h-3 w-3 text-emerald-500/60" />
                  Zero-Trust Accountability
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* User selector */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowUserSelect(!showUserSelect)}
                  className="flex cursor-pointer items-center gap-2 rounded-[10px] px-3.5 py-2 text-[12px] font-medium text-white
                    transition-all duration-200 hover:text-white/70"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  >
                    <User className="h-2.5 w-2.5 text-indigo-400" />
                  </div>
                  {user}
                  <ChevronDown
                    className={`h-3 w-3 text-white/60 transition-transform duration-200 ${showUserSelect ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {showUserSelect && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="absolute right-0 top-full z-50 mt-1.5 min-w-[150px] overflow-hidden rounded-[12px] py-1"
                      style={{
                        background: "rgba(14,14,28,0.98)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        backdropFilter: "blur(20px)",
                        boxShadow:
                          "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                      }}
                    >
                      {users.map((u) => (
                        <button
                          key={u}
                          onClick={() => {
                            setUser(u);
                            setShowUserSelect(false);
                          }}
                          className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium transition-all duration-150
                            ${
                              u === user
                                ? "bg-indigo-500/8 text-indigo-300"
                                : "text-white/90 hover:bg-white/[0.03] hover:text-white/70"
                            }`}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${
                              u === user
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
                className="h-5 w-px mx-0.5"
                style={{ background: "rgba(255,255,255,0.09)" }}
              />

              <button
                onClick={handleSeed}
                disabled={isSeeded || isLoading}
                className="flex cursor-pointer items-center gap-1.5 rounded-[10px] px-3.5 py-2
                  text-[12px] font-medium transition-all duration-200
                  disabled:pointer-events-none disabled:opacity-25"
                style={{
                  background: isSeeded
                    ? "rgba(52,211,153,0.06)"
                    : "rgba(99,102,241,0.06)",
                  border: isSeeded
                    ? "1px solid rgba(52,211,153,0.12)"
                    : "1px solid rgba(99,102,241,0.12)",
                  color: isSeeded
                    ? "rgba(110,231,183,0.8)"
                    : "rgba(165,180,252,0.8)",
                }}
              >
                {isSeeded ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Database className="h-3.5 w-3.5" />
                )}
                {isSeeded ? "Loaded" : "Seed Memory"}
              </button>

              <button
                onClick={handleClear}
                className="flex cursor-pointer items-center gap-1.5 rounded-[10px] px-3.5 py-2
                  text-[12px] font-medium transition-all duration-200 hover:opacity-80"
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.12)",
                  color: "rgba(252,165,165,0.8)",
                }}
                title="Clear demo state and reset memory context"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={chatContainerRef}
            className="relative flex-1 overflow-y-auto px-6 py-5 space-y-4"
            style={{
              scrollbarWidth: "none",
            }}
          >
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center select-none">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="relative flex h-16 w-16 items-center justify-center rounded-2xl mb-5"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)",
                      border: "1px solid rgba(99,102,241,0.08)",
                    }}
                  >
                    <MessageSquare className="h-7 w-7 text-indigo-400/30" />
                    <motion.div
                      className="absolute -top-1.5 -right-1.5"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Sparkles className="h-4 w-4 text-amber-400/30" />
                    </motion.div>
                  </div>
                  <BlurText
                    text="Start a Conversation"
                    className="text-sm font-semibold text-white mb-1.5"
                    delay={50}
                    animateBy="words"
                    direction="top"
                  />
                  <p className="text-[13px] text-white/60 max-w-xs leading-relaxed">
                    Send a message to analyze accountability. Seed memory first
                    for historical context.
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/[0.04]" />
                    <span className="text-[9px] font-semibold tracking-[0.2em] text-white/90 uppercase">
                      Quick prompts below
                    </span>
                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/[0.04]" />
                  </div>
                </motion.div>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={`${i}-${msg.timestamp}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className={`flex flex-col gap-1 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* System */}
                  {msg.role === "system" && (
                    <div
                      className="flex items-center gap-3 rounded-[14px] px-4 py-3 text-[13px] w-full"
                      style={{
                        background: "rgba(99,102,241,0.03)",
                        border: "1px solid rgba(99,102,241,0.06)",
                        color: "rgba(165,180,252,0.6)",
                      }}
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: "rgba(99,102,241,0.08)",
                          border: "1px solid rgba(99,102,241,0.12)",
                        }}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400/60" />
                      </div>
                      <span className="leading-relaxed">{msg.content}</span>
                    </div>
                  )}

                  {/* User */}
                  {msg.role === "user" && (
                    <div className="max-w-[72%] group">
                      <div className="mb-1 flex items-center justify-end gap-2">
                        <span className="text-[10px] text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {formatTime(msg.timestamp)}
                        </span>
                        <span className="text-[11px] font-medium text-white/80">
                          {user}
                        </span>
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)",
                            border: "1px solid rgba(99,102,241,0.2)",
                          }}
                        >
                          <User className="h-2.5 w-2.5 text-indigo-400/70" />
                        </div>
                      </div>
                      <div
                        className="rounded-[16px] rounded-tr-[6px] px-4 py-3 text-[13px] leading-relaxed"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.08) 100%)",
                          border: "1px solid rgba(99,102,241,0.12)",
                          color: "rgba(255,255,255,0.85)",
                          boxShadow: "0 2px 8px rgba(99,102,241,0.04)",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {/* Assistant */}
                  {msg.role === "assistant" && (
                    <div className="max-w-[80%] group">
                      <div className="mb-1 flex items-center gap-2">
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full"
                          style={{
                            background: msg.content.includes("Contradiction")
                              ? "rgba(248,113,113,0.12)"
                              : "rgba(139,92,246,0.12)",
                            border: msg.content.includes("Contradiction")
                              ? "1px solid rgba(248,113,113,0.18)"
                              : "1px solid rgba(139,92,246,0.15)",
                          }}
                        >
                          <Bot
                            className={`h-2.5 w-2.5 ${
                              msg.content.includes("Contradiction")
                                ? "text-red-400/70"
                                : "text-violet-400/70"
                            }`}
                          />
                        </div>
                        <GradientText
                          colors={["#c7d2fe", "#818cf8", "#c7d2fe"]}
                          animationSpeed={4}
                          className="text-[12px] font-semibold tracking-wide"
                        >
                          TeamTruth Agent
                        </GradientText>
                        {msg.trustScore != null && (
                          <GlowBadge
                            variant={getTrustVariant(msg.trustScore)}
                          >
                            <TrustTrend score={msg.trustScore} />
                            {msg.trustScore}%
                          </GlowBadge>
                        )}
                        <span className="text-[10px] text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <SpotlightCard
                        className="rounded-[16px] rounded-tl-[6px] px-4 py-3.5 text-[13px] leading-[1.65]"
                        spotlightColor="rgba(139,92,246,0.15)"
                        style={{
                          background: msg.content.includes("Contradiction")
                            ? "linear-gradient(135deg, rgba(248,113,113,0.05) 0%, rgba(239,68,68,0.02) 100%)"
                            : "rgba(255,255,255,0.09)",
                          border: msg.content.includes("Contradiction")
                            ? "1px solid rgba(248,113,113,0.15)"
                            : "1px solid rgba(255,255,255,0.09)",
                          color: msg.content.includes("Contradiction")
                            ? "rgba(254,202,202,0.85)"
                            : "rgba(203,213,225,0.75)",
                          boxShadow: msg.content.includes("Contradiction")
                            ? "0 2px 12px rgba(239,68,68,0.03)"
                            : "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </SpotlightCard>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5"
              >
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                >
                  <Bot className="h-2.5 w-2.5 text-violet-400/70" />
                </div>
                <div
                  className="flex items-center gap-2 rounded-[14px] px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <TypingIndicator />
                  <span className="text-[11px] text-white/60 font-medium">
                    Analyzing
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />

            {/* Scroll btn */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={scrollToBottom}
                  className="sticky bottom-4 left-1/2 -translate-x-1/2 z-20 flex h-8 w-8 cursor-pointer items-center
                    justify-center rounded-full text-white/80 transition-colors hover:text-white/60"
                  style={{
                    background: "rgba(12,12,24,0.9)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ── Quick Messages ── */}
          <div
            className="flex gap-1.5 overflow-x-auto px-6 py-2.5"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              scrollbarWidth: "none",
            }}
          >
            {quickMessages.map((qm) => (
              <button
                key={qm.text}
                onClick={() => setInput(qm.text)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px]
                  px-3 py-2 text-[11px] font-medium text-white/70
                  transition-all duration-200 hover:text-white"
                style={{
                  background: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span className="text-[12px]">{qm.icon}</span>
                <span className="max-w-[160px] truncate">{qm.text}</span>
              </button>
            ))}
          </div>

          {/* ── Input ── */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 px-6 py-4"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.09)",
              background: inputFocused
                ? "rgba(255,255,255,0.008)"
                : "transparent",
              transition: "background 0.3s ease",
            }}
          >
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={`Message as ${user}…`}
                disabled={isLoading}
                className="w-full rounded-[12px] px-4 py-3 text-[13px] text-white/80
                  placeholder-white/20 outline-none transition-all duration-200
                  disabled:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: inputFocused
                    ? "1px solid rgba(99,102,241,0.2)"
                    : "1px solid rgba(255,255,255,0.09)",
                  boxShadow: inputFocused
                    ? "0 0 0 3px rgba(99,102,241,0.04), 0 2px 8px rgba(0,0,0,0.2)"
                    : "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
              <AnimatePresence>
                {input.trim() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Zap className="h-3 w-3 text-indigo-400/25" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className={`transition-opacity duration-200 ${!input.trim() || isLoading ? "pointer-events-none opacity-40" : ""}`}>
              <StarBorderButton 
                onClick={handleSend} 
                className="h-[46px] w-[52px] !p-0 flex items-center justify-center shrink-0 cursor-pointer !rounded-[12px]" 
                color="rgba(99,102,241,0.5)"
              >
                {isLoading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Send className="h-4 w-4 text-white" />}
              </StarBorderButton>
            </div>
          </form>
        </div>

        {/* ───── RIGHT: TRUST DASHBOARD ───── */}
        <div
          className="hidden w-[360px] flex-col overflow-hidden lg:flex"
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.05)",
            background:
              "linear-gradient(180deg, rgba(12,12,24,0.95) 0%, rgba(8,8,16,0.98) 100%)",
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.05),
              0 1px 2px rgba(0,0,0,0.3),
              0 4px 8px rgba(0,0,0,0.2),
              0 16px 32px rgba(0,0,0,0.25),
              0 32px 64px rgba(0,0,0,0.15),
              inset 0 1px 0 rgba(255,255,255,0.07)
            `,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-3.5"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.09)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)",
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[10px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(16,185,129,0.04) 100%)",
                border: "1px solid rgba(52,211,153,0.12)",
              }}
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400/70" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-white/80 tracking-[-0.01em]">
                Trust Engine
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PulsingDot color="bg-emerald-400" size="h-1.5 w-1.5" />
                <span className="text-[10px] text-white/60 font-medium">
                  Real-time monitoring
                </span>
              </div>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto space-y-4 p-4"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Trust Gauge */}
            <SpotlightCard
              className="flex flex-col items-center p-5"
              spotlightColor={
                trustScore == null
                  ? "rgba(99,102,241,0.06)"
                  : trustScore >= 66
                    ? "rgba(52,211,153,0.06)"
                    : trustScore >= 33
                      ? "rgba(251,191,36,0.06)"
                      : "rgba(248,113,113,0.06)"
              }
            >
              <h3 className="mb-4 text-[9px] font-semibold tracking-[0.2em] text-white/60 uppercase">
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
                      className={`text-3xl font-bold tracking-tight ${
                        trustScore >= 66
                          ? "text-emerald-400"
                          : trustScore >= 33
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    />
                    <span className="text-base font-medium text-white/90">
                      %
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-white/70 font-medium">
                    {trustScore >= 66
                      ? "Reliable contributor"
                      : trustScore >= 33
                        ? "Needs attention"
                        : "High risk individual"}
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center py-5 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    <Clock className="h-5 w-5 text-white/90" />
                  </motion.div>
                  <p className="text-[11px] text-white/90">
                    Awaiting first interaction…
                  </p>
                </div>
              )}
            </SpotlightCard>

            {/* Stats */}
            {trustScore != null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                <SpotlightCard
                  className="p-4 text-center"
                  spotlightColor="rgba(99,102,241,0.06)"
                >
                  <Database className="h-3.5 w-3.5 text-indigo-400/30 mx-auto mb-2" />
                  <CountUp
                    to={memories.length}
                    from={0}
                    duration={1}
                    className="text-xl font-bold text-white/80"
                  />
                  <p className="mt-1 text-[9px] font-semibold tracking-[0.15em] text-white/60 uppercase">
                    Memories
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  className="p-4 text-center"
                  spotlightColor="rgba(248,113,113,0.06)"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400/30 mx-auto mb-2" />
                  <CountUp
                    to={infractions}
                    from={0}
                    duration={1}
                    className="text-xl font-bold text-white/80"
                  />
                  <p className="mt-1 text-[9px] font-semibold tracking-[0.15em] text-white/60 uppercase">
                    Infractions
                  </p>
                </SpotlightCard>
              </motion.div>
            )}

            {/* Memory Log */}
            {memories.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2.5"
              >
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="text-[9px] font-semibold tracking-[0.2em] text-white/60 uppercase">
                    Memory Log
                  </h3>
                  <span className="text-[10px] text-white/90 font-medium flex items-center gap-1">
                    <Hash className="h-2.5 w-2.5" />
                    {memories.length}
                  </span>
                </div>

                <div
                  className="space-y-1.5 max-h-[280px] overflow-y-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {memories.slice(0, 12).map((m, i) => {
                    const isBroken =
                      m.metadata?.type === "broken_promise" ||
                      m.metadata?.delivered === false;
                    const isAnalysis = m.metadata?.type === "ai_analysis";

                    return (
                      <motion.div
                        key={`mem-${i}`}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.25 }}
                        className="rounded-[10px] px-3.5 py-2.5 text-[11px] leading-relaxed
                          transition-all duration-150 hover:translate-x-0.5"
                        style={{
                          background: isBroken
                            ? "rgba(248,113,113,0.03)"
                            : isAnalysis
                              ? "rgba(99,102,241,0.03)"
                              : "rgba(255,255,255,0.09)",
                          border: isBroken
                            ? "1px solid rgba(248,113,113,0.08)"
                            : isAnalysis
                              ? "1px solid rgba(99,102,241,0.08)"
                              : "1px solid rgba(255,255,255,0.07)",
                          color: isBroken
                            ? "rgba(254,202,202,0.7)"
                            : isAnalysis
                              ? "rgba(199,210,254,0.6)"
                              : "rgba(148,163,184,0.5)",
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {isBroken ? (
                            <AlertTriangle className="h-2.5 w-2.5 text-red-400/50" />
                          ) : isAnalysis ? (
                            <Bot className="h-2.5 w-2.5 text-indigo-400/50" />
                          ) : (
                            <CheckCircle2 className="h-2.5 w-2.5 text-white/60" />
                          )}
                          <span className="font-semibold uppercase tracking-[0.1em] text-[8px] opacity-60">
                            {m.metadata?.type?.replace(/_/g, " ") || "record"}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-[11px]">{m.content}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
