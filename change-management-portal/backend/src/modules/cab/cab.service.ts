import { CabReviewStatus, CabVoteDecision, Role } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { recordAuditLog } from "../../middleware/auditLog";
import { resolveCabOutcome } from "../changeRequests/changeRequest.service";
import { notifyRole } from "../notifications/notification.service";

/** Minimum number of non-abstaining votes required before a review can resolve. */
const QUORUM = 2;

export async function listPendingReviews() {
  return prisma.cabReview.findMany({
    where: { status: CabReviewStatus.PENDING },
    include: {
      changeRequest: {
        include: { requester: { select: { id: true, name: true } } },
      },
      votes: { include: { reviewer: { select: { id: true, name: true } } } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getReview(id: string) {
  const review = await prisma.cabReview.findUnique({
    where: { id },
    include: {
      changeRequest: { include: { requester: { select: { id: true, name: true } }, riskAssessment: true } },
      votes: { include: { reviewer: { select: { id: true, name: true } } } },
    },
  });
  if (!review) throw ApiError.notFound("CAB review not found");
  return review;
}

export async function castVote(
  reviewId: string,
  reviewerId: string,
  decision: CabVoteDecision,
  comment: string | undefined
) {
  const review = await prisma.cabReview.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound("CAB review not found");
  if (review.status !== CabReviewStatus.PENDING) {
    throw ApiError.conflict("This CAB review has already been completed");
  }

  await prisma.cabVote.upsert({
    where: { cabReviewId_reviewerId: { cabReviewId: reviewId, reviewerId } },
    create: { cabReviewId: reviewId, reviewerId, decision, comment },
    update: { decision, comment },
  });

  await recordAuditLog({
    entityType: "CabReview",
    entityId: reviewId,
    action: "VOTE_CAST",
    actorId: reviewerId,
    changes: { decision },
  });

  await notifyRole(Role.CHANGE_MANAGER, {
    type: "CAB_VOTE_CAST",
    title: "CAB vote cast",
    message: `A CAB member voted ${decision} on review ${reviewId}.`,
    entityType: "CabReview",
    entityId: reviewId,
  });

  return maybeResolveReview(reviewId);
}

async function maybeResolveReview(reviewId: string) {
  const review = await prisma.cabReview.findUnique({
    where: { id: reviewId },
    include: { votes: true },
  });
  if (!review || review.status !== CabReviewStatus.PENDING) return review;

  const decisive = review.votes.filter((v) => v.decision !== CabVoteDecision.ABSTAIN);
  if (decisive.length < QUORUM) {
    return review;
  }

  const rejectCount = decisive.filter((v) => v.decision === CabVoteDecision.REJECT).length;
  const outcome: "APPROVED" | "REJECTED" = rejectCount > 0 ? "REJECTED" : "APPROVED";

  const updatedReview = await prisma.cabReview.update({
    where: { id: reviewId },
    data: {
      status: CabReviewStatus.COMPLETED,
      outcome: outcome === "APPROVED" ? CabVoteDecision.APPROVE : CabVoteDecision.REJECT,
      completedAt: new Date(),
    },
  });

  await recordAuditLog({
    entityType: "CabReview",
    entityId: reviewId,
    action: `RESOLVED_${outcome}`,
  });

  await resolveCabOutcome(review.changeRequestId, outcome);

  return updatedReview;
}
