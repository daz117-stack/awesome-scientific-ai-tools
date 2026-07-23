import type { ChangeStatus, RiskLevel } from "../types";

export const STATUS_LABELS: Record<ChangeStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  RISK_ASSESSMENT: "Risk Assessment",
  CAB_REVIEW: "CAB Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  IMPLEMENTED: "Implemented",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<ChangeStatus, string> = {
  DRAFT: "bg-slate-200 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  RISK_ASSESSMENT: "bg-amber-100 text-amber-700",
  CAB_REVIEW: "bg-purple-100 text-purple-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  SCHEDULED: "bg-sky-100 text-sky-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  IMPLEMENTED: "bg-teal-100 text-teal-700",
  CLOSED: "bg-slate-300 text-slate-800",
  CANCELLED: "bg-neutral-200 text-neutral-600",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export const ROLE_LABELS: Record<string, string> = {
  REQUESTER: "Requester",
  IMPLEMENTER: "Implementer",
  CHANGE_MANAGER: "Change Manager",
  CAB_MEMBER: "CAB Member",
  ADMIN: "Administrator",
  AUDITOR: "Auditor",
};
