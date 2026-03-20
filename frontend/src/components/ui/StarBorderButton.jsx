// Button with animated conic-gradient border (star-border CSS)
export default function StarBorderButton({
  children,
  onClick,
  className = "",
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`star-border cursor-pointer px-8 py-3.5 font-semibold text-white
        transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]
        disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

