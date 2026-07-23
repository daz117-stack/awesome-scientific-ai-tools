import { ChangeStatus } from "@prisma/client";
import { ApiError } from "../../utils/apiError";

const TRANSITIONS: Record<ChangeStatus, ChangeStatus[]> = {
  [ChangeStatus.DRAFT]: [ChangeStatus.SUBMITTED, ChangeStatus.CANCELLED],
  [ChangeStatus.SUBMITTED]: [ChangeStatus.RISK_ASSESSMENT, ChangeStatus.CANCELLED],
  [ChangeStatus.RISK_ASSESSMENT]: [ChangeStatus.CAB_REVIEW, ChangeStatus.APPROVED, ChangeStatus.CANCELLED],
  [ChangeStatus.CAB_REVIEW]: [ChangeStatus.APPROVED, ChangeStatus.REJECTED, ChangeStatus.CANCELLED],
  [ChangeStatus.APPROVED]: [ChangeStatus.SCHEDULED, ChangeStatus.CANCELLED],
  [ChangeStatus.SCHEDULED]: [ChangeStatus.IN_PROGRESS, ChangeStatus.CANCELLED],
  [ChangeStatus.IN_PROGRESS]: [ChangeStatus.IMPLEMENTED],
  [ChangeStatus.IMPLEMENTED]: [ChangeStatus.CLOSED],
  [ChangeStatus.CLOSED]: [],
  [ChangeStatus.REJECTED]: [],
  [ChangeStatus.CANCELLED]: [],
};

export function assertTransition(from: ChangeStatus, to: ChangeStatus) {
  const allowed = TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw ApiError.conflict(`Cannot move change request from ${from} to ${to}`);
  }
}

export function isTerminal(status: ChangeStatus): boolean {
  return TRANSITIONS[status].length === 0;
}
