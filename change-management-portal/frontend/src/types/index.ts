export type Role = "REQUESTER" | "IMPLEMENTER" | "CHANGE_MANAGER" | "CAB_MEMBER" | "ADMIN" | "AUDITOR";

export type ChangeType = "STANDARD" | "NORMAL" | "EMERGENCY";

export type ChangeStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "RISK_ASSESSMENT"
  | "CAB_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "IMPLEMENTED"
  | "CLOSED"
  | "CANCELLED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CabVoteDecision = "APPROVE" | "REJECT" | "ABSTAIN";

export type CabReviewStatus = "PENDING" | "COMPLETED";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: string | null;
}

export interface RiskAssessment {
  id: string;
  impact: number;
  probability: number;
  urgency: number;
  affectedUsers: number;
  downtimeMinutes: number;
  notes?: string | null;
  score: number;
  level: RiskLevel;
}

export interface CabVote {
  id: string;
  decision: CabVoteDecision;
  comment?: string | null;
  createdAt: string;
  reviewer: UserSummary;
}

export interface CabReview {
  id: string;
  scheduledAt: string;
  status: CabReviewStatus;
  outcome?: CabVoteDecision | null;
  votes: CabVote[];
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: UserSummary;
}

export interface ChangeRequest {
  id: string;
  reference: string;
  title: string;
  description: string;
  justification: string;
  type: ChangeType;
  status: ChangeStatus;
  requester: UserSummary;
  implementer?: UserSummary | null;
  changeManager?: UserSummary | null;
  systemsAffected: string[];
  plannedStart?: string | null;
  plannedEnd?: string | null;
  implementationPlan?: string | null;
  testPlan?: string | null;
  backoutPlan?: string | null;
  riskLevel?: RiskLevel | null;
  riskScore?: number | null;
  riskAssessment?: RiskAssessment | null;
  cabReview?: CabReview | null;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  closedAt?: string | null;
}

export interface KpiSummary {
  windowDays: number;
  totalChangeRequests: number;
  successRate: number;
  avgLeadTimeHours: number;
  emergencyChangeCount: number;
  rejectedCount: number;
  byStatus: { status: ChangeStatus; count: number }[];
  byRiskLevel: { riskLevel: RiskLevel | null; count: number }[];
  byType: { type: ChangeType; count: number }[];
}

export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, unknown> | null;
  createdAt: string;
  actor?: UserSummary & { role: Role };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  read: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  reference: string;
  title: string;
  type: ChangeType;
  status: ChangeStatus;
  riskLevel?: RiskLevel | null;
  plannedStart: string;
  plannedEnd: string;
  systemsAffected: string[];
}
