import { motion } from "framer-motion";

// Animates text in letter-by-letter with stagger
export default function SplitText({
  text = "",
  className = "",
  delay = 0,
  stagger = 0.03,
}) {
  const letters = text.split("");

  return (
    <span className={className} aria-label={text}>
      {letters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.4,
            delay: delay + i * stagger,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

