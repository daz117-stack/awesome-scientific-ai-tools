import { RiskLevel } from "@prisma/client";

export interface RiskInput {
  impact: number;
  probability: number;
  urgency: number;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
}

/**
 * Score is bounded 3-30 (impact/probability/urgency each 1-5, weighted so
 * impact x probability dominates over urgency). Thresholds are calibrated
 * so a routine, low-blast-radius change lands LOW and anything touching
 * many users with real failure probability lands HIGH/CRITICAL.
 */
export function computeRisk(input: RiskInput): RiskResult {
  const { impact, probability, urgency } = input;
  const score = impact * probability + urgency;

  let level: RiskLevel;
  if (score <= 7) level = RiskLevel.LOW;
  else if (score <= 14) level = RiskLevel.MEDIUM;
  else if (score <= 21) level = RiskLevel.HIGH;
  else level = RiskLevel.CRITICAL;

  return { score, level };
}

export function requiresCabReview(level: RiskLevel, changeType: "STANDARD" | "NORMAL" | "EMERGENCY"): boolean {
  if (changeType === "STANDARD" && level === RiskLevel.LOW) return false;
  return true;
}
