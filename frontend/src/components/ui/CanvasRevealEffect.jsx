import { useEffect, useRef } from "react";

/**
 * CanvasRevealEffect — plain Canvas 2D implementation.
 * No WebGL, no @react-three/fiber — avoids WebGL context conflicts
 * with the existing Three.js LaserFlow renderer.
 *
 * Props match the original Aceternity API:
 *   colors          – array of [r,g,b] tuples
 *   animationSpeed  – 0.1 (slow) → 1.0 (fast), default 0.4
 *   dotSize         – px, default 3
 *   showGradient    – fade-to-dark overlay at bottom, default true
 *   containerClassName – extra classes on wrapper
 */
export function CanvasRevealEffect({
  colors = [[0, 255, 255]],
  animationSpeed = 0.4,
  dotSize = 3,
  showGradient = true,
  containerClassName = "",
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ── Setup ──────────────────────────────────────────────
    const CELL = dotSize + 2;          // grid cell size (dot + gap)
    const startTime = performance.now();

    // Expand color list to 6 entries so we can pick by slot index
    let col6 = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) col6 = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    if (colors.length === 3) col6 = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];

    // Seeded-random helpers (same algorithm as the original GLSL)
    const PHI = 1.6180339887498948482;
    function rand2(ax, ay) {
      const d = Math.sqrt((ax * PHI - ay) ** 2 + (ay * PHI - ax) ** 2) * 0.5;
      return Math.abs(Math.tan(d) * ax) % 1;
    }

    // Per-cell cached random values (only recompute on resize)
    let cells = [];
    let cols = 0, rows = 0;

    function buildCells(W, H) {
      cols = Math.ceil(W / CELL);
      rows = Math.ceil(H / CELL);
      cells = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const showOffset = rand2(col + 1, row + 1);
          const colorIdx = Math.floor(showOffset * 6) % 6;
          const [r, g, b] = col6[colorIdx];
          // Random phase offset so not all dots fire at once
          cells.push({ showOffset, r, g, b });
        }
      }
    }

    // ── Resize observer ────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const W = canvas.parentElement?.clientWidth || 1;
      const H = canvas.parentElement?.clientHeight || 1;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(dpr, dpr);
      buildCells(W, H);
    });
    ro.observe(canvas.parentElement || canvas);

    // Initial size
    const W0 = canvas.parentElement?.clientWidth || 300;
    const H0 = canvas.parentElement?.clientHeight || 300;
    const dpr0 = window.devicePixelRatio || 1;
    canvas.width = W0 * dpr0;
    canvas.height = H0 * dpr0;
    canvas.style.width = W0 + "px";
    canvas.style.height = H0 + "px";
    ctx.scale(dpr0, dpr0);
    buildCells(W0, H0);

    // ── Render loop ────────────────────────────────────────
    function draw(now) {
      rafRef.current = requestAnimationFrame(draw);
      const t = (now - startTime) / 1000;           // seconds elapsed
      const speed = Math.max(0.05, animationSpeed);

      const W = parseInt(canvas.style.width);
      const H = parseInt(canvas.style.height);

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < cells.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const { showOffset, r, g, b } = cells[i];

        const x = col * CELL;
        const y = row * CELL;

        // Intro reveal: dot becomes visible after intro_offset time
        const introOffset = showOffset * 0.15 + 0.01;
        const tAdj = t * speed;
        if (tAdj < introOffset) continue;

        // Flash-in then hold
        const flashEnd = introOffset + 0.1;
        let op;
        if (tAdj < flashEnd) {
          // Flash — briefly brighter
          op = ((tAdj - introOffset) / 0.1) * 1.25;
        } else {
          // Steady randomised opacity (0.3 – 1.0 band)
          // Cycle through "frames" every ~5 s using seeded rand
          const freq = 5.0;
          const frame = Math.floor(t / freq + showOffset + freq);
          const ro2 = rand2(col * frame + 1, row * frame + 1);
          const opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0];
          op = opacities[Math.floor(ro2 * 10) % 10];
        }

        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, op)})`;
        ctx.fillRect(x, y, dotSize, dotSize);
      }
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, animationSpeed, dotSize]);

  return (
    <div
      className={`h-full w-full relative overflow-hidden ${containerClassName}`}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", position: "absolute", inset: 0 }}
      />
      {showGradient && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(12,12,20,0.96) 0%, rgba(12,12,20,0.4) 50%, transparent 84%)",
          }}
        />
      )}
    </div>
  );
}

export default CanvasRevealEffect;
