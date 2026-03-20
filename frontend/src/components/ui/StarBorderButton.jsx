import React from "react";

export default function StarBorderButton({
  children,
  onClick,
  className = "",
  color = "#818cf8",
  speed = "3s",
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl
        bg-gradient-to-r from-indigo-600 to-violet-600
        text-white shadow-lg shadow-indigo-500/25
        transition-all duration-300
        hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40
        active:scale-95 cursor-pointer inline-flex items-center justify-center min-w-fit
        ${className}
      `}
    >
      {/* Animated border */}
      <span
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `conic-gradient(from var(--angle, 0deg), transparent 60%, ${color} 100%)`,
          padding: "1px",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          animation: `spin-border ${speed} linear infinite`,
        }}
      />
      {/* Children rendered directly — no extra wrapper */}
      {children}
      <style>{`
        @keyframes spin-border {
          to { --angle: 360deg; }
        }
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>
    </button>
  );
}

