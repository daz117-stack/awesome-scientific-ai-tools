import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/common/Card";
import { RiskBadge } from "../components/common/RiskBadge";
import * as cabApi from "../api/cab";
import { useAuth } from "../context/AuthContext";
import type { CabReviewWithChangeRequest } from "../api/cab";

export default function CabApprovalPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<CabReviewWithChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const data = await cabApi.listPendingReviews();
    setReviews(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const canVote = user?.role === "CAB_MEMBER" || user?.role === "ADMIN";

  async function vote(reviewId: string, decision: "APPROVE" | "REJECT" | "ABSTAIN") {
    setError(null);
    try {
      await cabApi.castVote(reviewId, decision, commentDrafts[reviewId]);
      await load();
    } catch {
      setError("Could not record vote. You may have already voted, or the review closed.");
    }
  }

  return (
    <AppShell title="CAB Approvals">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {!loading && reviews.length === 0 && (
        <Card>
          <p className="text-sm text-slate-400">No change requests are currently pending CAB review.</p>
        </Card>
      )}
      <div className="space-y-4">
        {reviews.map((review) => {
          const myVote = review.votes.find((v) => v.reviewer.id === user?.id);
          return (
            <Card key={review.id}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <Link
                    to={`/change-requests/${review.changeRequest.id}`}
                    className="text-base font-semibold text-brand-700 hover:underline"
                  >
                    {review.changeRequest.reference}: {review.changeRequest.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    Requested by {review.changeRequest.requester.name} · Scheduled{" "}
                    {new Date(review.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <RiskBadge level={review.changeRequest.riskLevel} />
              </div>
              <p className="mb-3 text-sm text-slate-700">{review.changeRequest.description}</p>

              <div className="mb-3 flex flex-wrap gap-2">
                {review.votes.map((v) => (
                  <span
                    key={v.id}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      v.decision === "APPROVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : v.decision === "REJECT"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {v.reviewer.name}: {v.decision}
                  </span>
                ))}
                {review.votes.length === 0 && <span className="text-xs text-slate-400">No votes yet</span>}
              </div>

              {canVote && !myVote && (
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
                  <input
                    className="input"
                    placeholder="Optional comment"
                    value={commentDrafts[review.id] ?? ""}
                    onChange={(e) => setCommentDrafts((d) => ({ ...d, [review.id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => vote(review.id, "APPROVE")}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => vote(review.id, "REJECT")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => vote(review.id, "ABSTAIN")}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Abstain
                    </button>
                  </div>
                </div>
              )}
              {myVote && (
                <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                  You voted <span className="font-semibold">{myVote.decision}</span> on this review.
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
