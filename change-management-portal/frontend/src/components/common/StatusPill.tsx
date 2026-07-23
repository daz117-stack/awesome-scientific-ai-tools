import type { ChangeStatus } from "../../types";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constants";

export function StatusPill({ status }: { status: ChangeStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
