import { useState, useEffect, useRef } from "react";

// Smooth number counter with ease-out easing — perfect for trust score
export default function AnimatedCounter({
  from = 0,
  to = 100,
  duration = 1200,
  className = "",
  suffix = "",
}) {
  const [value, setValue] = useState(from);
  const startTime = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = from;
    const end = to;

    function tick(timestamp) {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    startTime.current = null;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [from, to, duration]);

  return (
    <span className={className}>
      {value}
      {suffix}
    </span>
  );
}

