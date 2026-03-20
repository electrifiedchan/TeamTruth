import { useNavigate } from "react-router-dom";
import Aurora from "./ui/Aurora";
import SplitText from "./ui/SplitText";
import BlurText from "./ui/BlurText";
import GradientText from "./ui/GradientText";
import StarBorderButton from "./ui/StarBorderButton";
import { Shield, Zap, Brain } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "#06010f" }}>

      {/* Aurora Background */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#3b0764", "#7c3aed", "#ef4444"]}
          amplitude={1.3}
          speed={0.5}
        />
      </div>

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(6,1,15,0.85) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">

        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase"
          style={{
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "rgba(196,181,253,0.9)",
          }}
        >
          <Zap className="h-3 w-3 text-violet-400" />
          Zero-Trust Accountability Agent
        </div>

        {/* Headline */}
        <h1 className="mb-4 text-5xl md:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
          <GradientText
            colors={["#e2e8f0", "#c4b5fd", "#e2e8f0"]}
            animationSpeed={8}
            className="font-black"
          >
            TeamTruth
          </GradientText>
        </h1>

        {/* Subheadline */}
        <div className="mb-4 text-2xl md:text-3xl font-bold"
          style={{ color: "rgba(255,255,255,0.85)" }}>
          <SplitText
            text="We don't track tasks."
            delay={40}
            animationFrom={{ opacity: 0, transform: "translateY(20px)" }}
            animationTo={{ opacity: 1, transform: "translateY(0)" }}
          />
          <span style={{ color: "#f87171" }}>
            <SplitText
              text=" We track the truth."
              delay={40}
            />
          </span>
        </div>

        {/* Subtitle */}
        <div className="mb-10 max-w-2xl" style={{ color: "rgba(255,255,255,0.5)" }}>
          <BlurText
            text="Catch broken promises, missed deadlines, and contradictions before they sink your project. Powered by Hindsight AI memory."
            delay={20}
            direction="bottom"
            className="text-base md:text-lg leading-relaxed"
          />
        </div>

        {/* CTA */}
        <div onClick={() => navigate("/chat")} className="cursor-pointer">
          <StarBorderButton color="#ef4444" speed="3s">
            <span className="px-8 py-2 text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Initialize Agent Demo
            </span>
          </StarBorderButton>
        </div>

        {/* Feature pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Brain, label: "Hindsight Memory" },
            { icon: Shield, label: "Contradiction Detection" },
            { icon: Zap, label: "Live Trust Score" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Icon className="h-3 w-3 text-violet-400" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
