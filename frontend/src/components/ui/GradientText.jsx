// Simple gradient-colored inline text
export default function GradientText({
  children,
  className = "",
  from = "#6366f1",
  via = "#8b5cf6",
  to = "#06b6d4",
}) {
  return (
    <span
      className={`bg-clip-text [-webkit-text-fill-color:transparent] ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${via}, ${to})`,
      }}
    >
      {children}
    </span>
  );
}

