import type { RiskLevel } from "../types";

export function computeRiskPreview(impact: number, probability: number, urgency: number) {
  const score = impact * probability + urgency;
  let level: RiskLevel;
  if (score <= 7) level = "LOW";
  else if (score <= 14) level = "MEDIUM";
  else if (score <= 21) level = "HIGH";
  else level = "CRITICAL";
  return { score, level };
}
