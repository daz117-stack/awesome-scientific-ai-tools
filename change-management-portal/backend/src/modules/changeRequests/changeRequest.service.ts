import { ChangeStatus, ChangeType, Role } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { recordAuditLog } from "../../middleware/auditLog";
import { assertTransition } from "./changeRequest.stateMachine";
import { computeRisk, requiresCabReview } from "./risk.util";
import { notifyRole, notifyUser } from "../notifications/notification.service";

const changeRequestInclude = {
  requester: { select: { id: true, name: true, email: true } },
  implementer: { select: { id: true, name: true, email: true } },
  changeManager: { select: { id: true, name: true, email: true } },
  riskAssessment: true,
  cabReview: { include: { votes: { include: { reviewer: { select: { id: true, name: true } } } } } },
  comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" as const } },
};

async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.changeRequest.count({
    where: { reference: { startsWith: `CHG-${year}-` } },
  });
  return `CHG-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function createChangeRequest(input: {
  title: string;
  description: string;
  justification: string;
  type: ChangeType;
  systemsAffected: string[];
  plannedStart?: Date;
  plannedEnd?: Date;
  implementationPlan?: string;
  testPlan?: string;
  backoutPlan?: string;
  requesterId: string;
}) {
  const reference = await nextReference();
  const changeRequest = await prisma.changeRequest.create({
    data: {
      reference,
      title: input.title,
      description: input.description,
      justification: input.justification,
      type: input.type,
      systemsAffected: input.systemsAffected,
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
      implementationPlan: input.implementationPlan,
      testPlan: input.testPlan,
      backoutPlan: input.backoutPlan,
      requesterId: input.requesterId,
    },
    include: changeRequestInclude,
  });

  await recordAuditLog({
    entityType: "ChangeRequest",
    entityId: changeRequest.id,
    action: "CREATED",
    actorId: input.requesterId,
    changes: { title: input.title, type: input.type },
  });

  return changeRequest;
}

export async function listChangeRequests(filters: {
  status?: ChangeStatus;
  requesterId?: string;
  type?: ChangeType;
}) {
  return prisma.changeRequest.findMany({
    where: {
      status: filters.status,
      requesterId: filters.requesterId,
      type: filters.type,
    },
    include: changeRequestInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getChangeRequest(id: string) {
  const changeRequest = await prisma.changeRequest.findUnique({
    where: { id },
    include: changeRequestInclude,
  });
  if (!changeRequest) throw ApiError.notFound("Change request not found");
  return changeRequest;
}

async function requireDraftOwnership(id: string) {
  const changeRequest = await prisma.changeRequest.findUnique({ where: { id } });
  if (!changeRequest) throw ApiError.notFound("Change request not found");
  return changeRequest;
}

export async function updateChangeRequest(
  id: string,
  actorId: string,
  input: Partial<{
    title: string;
    description: string;
    justification: string;
    type: ChangeType;
    systemsAffected: string[];
    plannedStart: Date;
    plannedEnd: Date;
    implementationPlan: string;
    testPlan: string;
    backoutPlan: string;
  }>
) {
  const existing = await requireDraftOwnership(id);
  if (existing.status !== ChangeStatus.DRAFT) {
    throw ApiError.conflict("Only draft change requests can be edited");
  }

  const changeRequest = await prisma.changeRequest.update({
    where: { id },
    data: input,
    include: changeRequestInclude,
  });

  await recordAuditLog({
    entityType: "ChangeRequest",
    entityId: id,
    action: "UPDATED",
    actorId,
    changes: input as Record<string, unknown>,
  });

  return changeRequest;
}

async function transition(id: string, to: ChangeStatus, actorId: string | undefined, extra: Record<string, unknown> = {}) {
  const changeRequest = await prisma.changeRequest.findUnique({ where: { id } });
  if (!changeRequest) throw ApiError.notFound("Change request not found");
  assertTransition(changeRequest.status, to);

  const updated = await prisma.changeRequest.update({
    where: { id },
    data: {
      status: to,
      ...(to === ChangeStatus.SUBMITTED ? { submittedAt: new Date() } : {}),
      ...(to === ChangeStatus.CLOSED ? { closedAt: new Date() } : {}),
      ...extra,
    },
    include: changeRequestInclude,
  });

  await recordAuditLog({
    entityType: "ChangeRequest",
    entityId: id,
    action: `STATUS_${to}`,
    actorId,
    changes: { from: changeRequest.status, to },
  });

  return updated;
}

export async function submitChangeRequest(id: string, actorId: string) {
  const updated = await transition(id, ChangeStatus.SUBMITTED, actorId);
  await notifyRole(Role.CHANGE_MANAGER, {
    type: "CHANGE_SUBMITTED",
    title: "New change request submitted",
    message: `${updated.reference}: ${updated.title} was submitted and needs triage.`,
    entityType: "ChangeRequest",
    entityId: id,
  });
  return updated;
}

export async function triageChangeRequest(id: string, changeManagerId: string, actorId: string) {
  const updated = await transition(id, ChangeStatus.RISK_ASSESSMENT, actorId, { changeManagerId });
  await notifyUser({
    userId: changeManagerId,
    type: "RISK_ASSESSMENT_REQUIRED",
    title: "Risk assessment required",
    message: `${updated.reference}: ${updated.title} is assigned to you for risk assessment.`,
    entityType: "ChangeRequest",
    entityId: id,
  });
  return updated;
}

export async function submitRiskAssessment(
  id: string,
  actorId: string,
  input: {
    impact: number;
    probability: number;
    urgency: number;
    affectedUsers: number;
    downtimeMinutes: number;
    notes?: string;
  }
) {
  const changeRequest = await prisma.changeRequest.findUnique({ where: { id } });
  if (!changeRequest) throw ApiError.notFound("Change request not found");
  if (changeRequest.status !== ChangeStatus.RISK_ASSESSMENT) {
    throw ApiError.conflict("Change request is not awaiting risk assessment");
  }

  const { score, level } = computeRisk(input);

  await prisma.riskAssessment.upsert({
    where: { changeRequestId: id },
    create: { changeRequestId: id, ...input, score, level, assessedById: actorId },
    update: { ...input, score, level, assessedById: actorId },
  });

  const needsCab = requiresCabReview(level, changeRequest.type);

  let updated;
  if (needsCab) {
    updated = await transition(id, ChangeStatus.CAB_REVIEW, actorId, { riskLevel: level, riskScore: score });
    await prisma.cabReview.create({
      data: { changeRequestId: id, scheduledAt: changeRequest.plannedStart ?? new Date() },
    });
    await notifyRole(Role.CAB_MEMBER, {
      type: "CAB_REVIEW_REQUIRED",
      title: "CAB review required",
      message: `${updated.reference}: ${updated.title} (${level} risk) is awaiting CAB review.`,
      entityType: "ChangeRequest",
      entityId: id,
    });
  } else {
    updated = await transition(id, ChangeStatus.APPROVED, actorId, { riskLevel: level, riskScore: score });
    await notifyUser({
      userId: updated.requesterId,
      type: "CHANGE_APPROVED",
      title: "Change request approved",
      message: `${updated.reference}: ${updated.title} was auto-approved (low risk, standard change).`,
      entityType: "ChangeRequest",
      entityId: id,
    });
  }

  return updated;
}

export async function scheduleChangeRequest(id: string, actorId: string, implementerId?: string) {
  const changeRequest = await prisma.changeRequest.findUnique({ where: { id } });
  if (!changeRequest) throw ApiError.notFound("Change request not found");
  if (!changeRequest.plannedStart || !changeRequest.plannedEnd) {
    throw ApiError.badRequest("Planned start and end dates must be set before scheduling");
  }
  const updated = await transition(id, ChangeStatus.SCHEDULED, actorId, implementerId ? { implementerId } : {});
  await notifyUser({
    userId: updated.requesterId,
    type: "CHANGE_SCHEDULED",
    title: "Change request scheduled",
    message: `${updated.reference}: ${updated.title} is scheduled for ${updated.plannedStart?.toISOString()}.`,
    entityType: "ChangeRequest",
    entityId: id,
  });
  return updated;
}

export async function startImplementation(id: string, actorId: string) {
  return transition(id, ChangeStatus.IN_PROGRESS, actorId);
}

export async function completeImplementation(id: string, actorId: string) {
  const updated = await transition(id, ChangeStatus.IMPLEMENTED, actorId);
  await notifyUser({
    userId: updated.requesterId,
    type: "CHANGE_IMPLEMENTED",
    title: "Change implemented",
    message: `${updated.reference}: ${updated.title} has been implemented.`,
    entityType: "ChangeRequest",
    entityId: id,
  });
  return updated;
}

export async function closeChangeRequest(id: string, actorId: string) {
  return transition(id, ChangeStatus.CLOSED, actorId);
}

export async function cancelChangeRequest(id: string, actorId: string) {
  const updated = await transition(id, ChangeStatus.CANCELLED, actorId);
  await notifyUser({
    userId: updated.requesterId,
    type: "CHANGE_CANCELLED",
    title: "Change request cancelled",
    message: `${updated.reference}: ${updated.title} was cancelled.`,
    entityType: "ChangeRequest",
    entityId: id,
  });
  return updated;
}

export async function addComment(changeRequestId: string, authorId: string, body: string) {
  const changeRequest = await prisma.changeRequest.findUnique({ where: { id: changeRequestId } });
  if (!changeRequest) throw ApiError.notFound("Change request not found");

  const comment = await prisma.comment.create({
    data: { changeRequestId, authorId, body },
    include: { author: { select: { id: true, name: true } } },
  });

  if (changeRequest.requesterId !== authorId) {
    await notifyUser({
      userId: changeRequest.requesterId,
      type: "COMMENT_ADDED",
      title: "New comment on your change request",
      message: `A new comment was added to ${changeRequest.reference}.`,
      entityType: "ChangeRequest",
      entityId: changeRequestId,
    });
  }

  return comment;
}

/** Used by the CAB module once votes resolve to APPROVE/REJECT. */
export async function resolveCabOutcome(id: string, outcome: "APPROVED" | "REJECTED", actorId?: string) {
  const status = outcome === "APPROVED" ? ChangeStatus.APPROVED : ChangeStatus.REJECTED;
  const updated = await transition(id, status, actorId);
  await notifyUser({
    userId: updated.requesterId,
    type: status === ChangeStatus.APPROVED ? "CHANGE_APPROVED" : "CHANGE_REJECTED",
    title: `Change request ${status === ChangeStatus.APPROVED ? "approved" : "rejected"} by CAB`,
    message: `${updated.reference}: ${updated.title} was ${status === ChangeStatus.APPROVED ? "approved" : "rejected"} by the CAB.`,
    entityType: "ChangeRequest",
    entityId: id,
  });
  return updated;
}
