import { apiClient } from "./client";
import type { CabReview, CabVoteDecision, ChangeRequest, UserSummary } from "../types";

export interface CabReviewWithChangeRequest extends CabReview {
  changeRequestId: string;
  changeRequest: ChangeRequest & { requester: UserSummary };
}

export async function listPendingReviews() {
  const { data } = await apiClient.get<CabReviewWithChangeRequest[]>("/cab-reviews");
  return data;
}

export async function getReview(id: string) {
  const { data } = await apiClient.get<CabReviewWithChangeRequest>(`/cab-reviews/${id}`);
  return data;
}

export async function castVote(id: string, decision: CabVoteDecision, comment?: string) {
  const { data } = await apiClient.post(`/cab-reviews/${id}/vote`, { decision, comment });
  return data;
}
