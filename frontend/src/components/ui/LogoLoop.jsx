import React from 'react';
import { motion } from 'framer-motion';

export default function LogoLoop({
  logos = [],
  speed = 100,
  direction = "left",
  logoHeight = 60,
  gap = 60,
  hoverSpeed = 0,
  scaleOnHover = false,
  fadeOut = true,
  fadeOutColor = "#030008",
  ariaLabel = "Technology stack",
  useCustomRender = false
}) {
  const duration = 2000 / speed;

  return (
    <div
      aria-label={ariaLabel}
      className="relative flex overflow-hidden w-full group"
      style={{ height: logoHeight }}
    >
      {fadeOut && (
        <>
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32"
            style={{
              background: `linear-gradient(to right, ${fadeOutColor}, transparent)`
            }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32"
            style={{
              background: `linear-gradient(to left, ${fadeOutColor}, transparent)`
            }}
          />
        </>
      )}

      {/* Unified track for continuous looping */}
      <motion.div
        className="flex shrink-0 items-center whitespace-nowrap"
        style={{ gap: gap, paddingRight: gap }}
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"]
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: duration,
        }}
      >
        {/* Render 4 sets to ensure it covers wide screens */}
        {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className={`flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 ${scaleOnHover ? "hover:scale-110 cursor-pointer" : ""}`}
            style={{ height: logoHeight }}
          >
            {logo.node && (
              <div className="flex items-center gap-3">
                <span className="text-3xl flex items-center">{logo.node}</span>
                <span className="text-xl font-bold tracking-wide">{logo.title}</span>
              </div>
            )}
            {logo.src && (
              <img
                src={logo.src}
                alt={logo.alt}
                style={{ height: logoHeight * 0.8 }}
                className="object-contain"
              />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
