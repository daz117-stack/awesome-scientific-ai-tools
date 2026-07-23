import type { RiskLevel } from "../../types";
import { RISK_COLORS } from "../../utils/constants";

export function RiskBadge({ level }: { level?: RiskLevel | null }) {
  if (!level) {
    return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">Unassessed</span>;
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_COLORS[level]}`}>
      {level}
    </span>
  );
}
