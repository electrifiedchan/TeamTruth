/**
 * Frontend trust score fallback (Layer 3).
 * Only detects contradiction from the AI's freeform analysis text.
 * Avoids false positives from scanning memories that always contain contradiction words.
 */
export function estimateTrustFromText(aiResponse = "") {
  const text = aiResponse.toLowerCase();

  // The AI signals a contradiction with this exact phrase
  const isContradiction = text.includes("contradiction detected");

  if (isContradiction) {
    return {
      trust_score: 45,
      contradiction_found: true,
      contradiction_summary: "Flagged by AI analysis.",
      severity: "major",
      source: "frontend_fallback",
    };
  }

  return {
    trust_score: 100,
    contradiction_found: false,
    contradiction_summary: "None",
    severity: "none",
    source: "frontend_fallback",
  };
}
