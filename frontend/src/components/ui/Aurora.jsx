import { useEffect, useRef } from "react";

export default function Aurora({
  colorStops = ["#3b0764", "#7c3aed", "#ef4444"],
  amplitude = 1.0,
  speed = 0.5,
  blend = 0.5,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const parseColor = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const lerpColor = (a, b, t) => [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];

    const colors = colorStops.map(parseColor);

    const drawFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const layers = 4;
      for (let l = 0; l < layers; l++) {
        const t = timeRef.current * speed + (l * Math.PI * 2) / layers;
        const colorIdx = (l / layers) * (colors.length - 1);
        const c1 = colors[Math.floor(colorIdx)];
        const c2 = colors[Math.min(Math.ceil(colorIdx), colors.length - 1)];
        const [r, g, b] = lerpColor(c1, c2, colorIdx % 1);

        const yBase = h * (0.4 + 0.2 * Math.sin(t * 0.7 + l));
        const waveH = h * 0.35 * amplitude;

        const grad = ctx.createRadialGradient(
          w * (0.3 + 0.4 * Math.sin(t * 0.5 + l * 1.3)),
          yBase,
          0,
          w * (0.3 + 0.4 * Math.sin(t * 0.5 + l * 1.3)),
          yBase,
          Math.max(w, h) * 0.7
        );
        grad.addColorStop(0, `rgba(${r},${g},${b},${0.18 - l * 0.02})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${0.08 - l * 0.01})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= w; x += 4) {
          const y =
            yBase +
            Math.sin((x / w) * Math.PI * 3 + t) * waveH * 0.5 +
            Math.sin((x / w) * Math.PI * 5 + t * 1.3 + l) * waveH * 0.3;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      timeRef.current += 0.008;
      animRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [colorStops, amplitude, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
