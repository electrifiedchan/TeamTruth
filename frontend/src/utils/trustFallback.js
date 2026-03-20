/**
 * Frontend keyword-based trust score estimator (Layer 3 fallback).
 * Used when the backend fails to return a structured trust score.
 */
export function estimateTrustFromText(aiResponse = "") {
  const text = aiResponse.toLowerCase();

  const signals = {
    critical: {
      words: ["fabricat", "caught lying", "directly contradicts", "proven false", "impossible timeline"],
      penalty: 40,
    },
    major: {
      words: ["contradict", "inconsistent", "conflicts with", "doesn't match", "discrepancy"],
      penalty: 25,
    },
    minor: {
      words: ["unclear", "vague", "unverified", "no evidence", "cannot confirm"],
      penalty: 10,
    },
    positive: {
      words: ["consistent", "aligns with", "confirmed", "matches", "verified"],
      bonus: 5,
    },
  };

  let score = 100;
  let contradictionFound = false;
  let severity = "none";

  for (const word of signals.critical.words) {
    if (text.includes(word)) {
      score -= signals.critical.penalty;
      contradictionFound = true;
      severity = "critical";
    }
  }
  for (const word of signals.major.words) {
    if (text.includes(word)) {
      score -= signals.major.penalty;
      contradictionFound = true;
      if (severity === "none") severity = "major";
    }
  }
  for (const word of signals.minor.words) {
    if (text.includes(word)) {
      score -= signals.minor.penalty;
      if (severity === "none") severity = "minor";
    }
  }
  for (const word of signals.positive.words) {
    if (text.includes(word) && !contradictionFound) {
      score = Math.min(100, score + signals.positive.bonus);
    }
  }

  return {
    trust_score: Math.max(0, Math.min(100, score)),
    contradiction_found: contradictionFound,
    contradiction_summary: contradictionFound ? "Detected via keyword analysis." : "None",
    severity,
    source: "frontend_fallback",
  };
}
