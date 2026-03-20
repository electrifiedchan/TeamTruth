import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

// Circular SVG gauge for the trust score
export default function TrustGauge({ score = 100, size = 180 }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  // Color based on score
  const color =
    score >= 66
      ? { stroke: "#34d399", glow: "rgba(52,211,153,0.3)", label: "TRUSTED" }
      : score >= 33
      ? { stroke: "#fbbf24", glow: "rgba(251,191,36,0.3)", label: "CAUTION" }
      : { stroke: "#f87171", glow: "rgba(248,113,113,0.3)", label: "UNTRUSTED" };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Active ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              filter: `drop-shadow(0 0 8px ${color.glow})`,
            }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter
            from={100}
            to={score}
            duration={1200}
            className="text-4xl font-bold text-white"
            suffix="%"
          />
          <span
            className="mt-1 text-xs font-semibold tracking-wider"
            style={{ color: color.stroke }}
          >
            {color.label}
          </span>
        </div>
      </div>
    </div>
  );
}

