import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/common/Card";
import { StatusPill } from "../components/common/StatusPill";
import { RiskBadge } from "../components/common/RiskBadge";
import { RiskAssessmentForm } from "../components/changeRequests/RiskAssessmentForm";
import * as changeRequestsApi from "../api/changeRequests";
import { useAuth } from "../context/AuthContext";
import type { ChangeRequest } from "../types";

export default function ChangeRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [cr, setCr] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    const data = await changeRequestsApi.getChangeRequest(id);
    setCr(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      await load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Action failed.";
      setActionError(message);
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    await changeRequestsApi.addComment(id, comment.trim());
    setComment("");
    await load();
  }

  if (loading || !cr) {
    return (
      <AppShell title="Change Request">
        <p className="text-sm text-slate-400">Loading…</p>
      </AppShell>
    );
  }

  const isRequester = user?.id === cr.requester.id;
  const isChangeManagerRole = user?.role === "CHANGE_MANAGER" || user?.role === "ADMIN";
  const canCancel = isRequester || isChangeManagerRole;

  return (
    <AppShell title={cr.reference}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{cr.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Requested by {cr.requester.name} · {cr.type} change
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={cr.riskLevel} />
          <StatusPill status={cr.status} />
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Details">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-800">{cr.description}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Business justification</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-800">{cr.justification}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="font-medium text-slate-500">Planned start</dt>
                  <dd className="mt-1 text-slate-800">
                    {cr.plannedStart ? new Date(cr.plannedStart).toLocaleString() : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Planned end</dt>
                  <dd className="mt-1 text-slate-800">
                    {cr.plannedEnd ? new Date(cr.plannedEnd).toLocaleString() : "—"}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Systems affected</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {cr.systemsAffected.length === 0 && <span className="text-slate-400">None listed</span>}
                  {cr.systemsAffected.map((s) => (
                    <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
              {cr.implementationPlan && (
                <div>
                  <dt className="font-medium text-slate-500">Implementation plan</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-slate-800">{cr.implementationPlan}</dd>
                </div>
              )}
              {cr.testPlan && (
                <div>
                  <dt className="font-medium text-slate-500">Test plan</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-slate-800">{cr.testPlan}</dd>
                </div>
              )}
              {cr.backoutPlan && (
                <div>
                  <dt className="font-medium text-slate-500">Backout / rollback plan</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-slate-800">{cr.backoutPlan}</dd>
                </div>
              )}
            </dl>
          </Card>

          {cr.riskAssessment && (
            <Card title="Risk assessment">
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <Metric label="Impact" value={cr.riskAssessment.impact} />
                <Metric label="Probability" value={cr.riskAssessment.probability} />
                <Metric label="Urgency" value={cr.riskAssessment.urgency} />
                <Metric label="Affected users" value={cr.riskAssessment.affectedUsers} />
                <Metric label="Downtime (min)" value={cr.riskAssessment.downtimeMinutes} />
                <Metric label="Score" value={cr.riskAssessment.score} />
              </div>
              {cr.riskAssessment.notes && (
                <p className="mt-3 text-sm text-slate-600">{cr.riskAssessment.notes}</p>
              )}
            </Card>
          )}

          {cr.cabReview && (
            <Card title="CAB review">
              <p className="mb-3 text-sm text-slate-500">
                Scheduled {new Date(cr.cabReview.scheduledAt).toLocaleString()} · {cr.cabReview.status}
                {cr.cabReview.outcome ? ` · Outcome: ${cr.cabReview.outcome}` : ""}
              </p>
              <ul className="space-y-2">
                {cr.cabReview.votes.map((v) => (
                  <li key={v.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{v.reviewer.name}</span>
                    <span
                      className={
                        v.decision === "APPROVE"
                          ? "text-emerald-600"
                          : v.decision === "REJECT"
                          ? "text-red-600"
                          : "text-slate-500"
                      }
                    >
                      {v.decision}
                    </span>
                  </li>
                ))}
                {cr.cabReview.votes.length === 0 && (
                  <li className="text-sm text-slate-400">No votes cast yet.</li>
                )}
              </ul>
            </Card>
          )}

          <Card title="Comments">
            <ul className="mb-4 space-y-3">
              {cr.comments.map((c) => (
                <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-600">{c.author.name}</span>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-slate-800">{c.body}</p>
                </li>
              ))}
              {cr.comments.length === 0 && <p className="text-sm text-slate-400">No comments yet.</p>}
            </ul>
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
                className="input"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Post
              </button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Workflow actions">
            <div className="space-y-2">
              {cr.status === "DRAFT" && (isRequester || isChangeManagerRole) && (
                <ActionButton onClick={() => runAction(() => changeRequestsApi.submitChangeRequest(cr.id))}>
                  Submit for triage
                </ActionButton>
              )}
              {cr.status === "SUBMITTED" && isChangeManagerRole && (
                <ActionButton onClick={() => runAction(() => changeRequestsApi.triageChangeRequest(cr.id))}>
                  Triage &amp; assign to me
                </ActionButton>
              )}
              {cr.status === "APPROVED" && isChangeManagerRole && (
                <ActionButton
                  disabled={!cr.plannedStart || !cr.plannedEnd}
                  onClick={() => runAction(() => changeRequestsApi.scheduleChangeRequest(cr.id))}
                >
                  Schedule change
                </ActionButton>
              )}
              {cr.status === "SCHEDULED" && (isChangeManagerRole || user?.role === "IMPLEMENTER") && (
                <ActionButton onClick={() => runAction(() => changeRequestsApi.startImplementation(cr.id))}>
                  Start implementation
                </ActionButton>
              )}
              {cr.status === "IN_PROGRESS" && (isChangeManagerRole || user?.role === "IMPLEMENTER") && (
                <ActionButton onClick={() => runAction(() => changeRequestsApi.completeImplementation(cr.id))}>
                  Mark implemented
                </ActionButton>
              )}
              {cr.status === "IMPLEMENTED" && isChangeManagerRole && (
                <ActionButton onClick={() => runAction(() => changeRequestsApi.closeChangeRequest(cr.id))}>
                  Close change request
                </ActionButton>
              )}
              {canCancel && !["CLOSED", "CANCELLED", "REJECTED", "IMPLEMENTED"].includes(cr.status) && (
                <ActionButton
                  variant="danger"
                  onClick={() => runAction(() => changeRequestsApi.cancelChangeRequest(cr.id))}
                >
                  Cancel change request
                </ActionButton>
              )}
            </div>
          </Card>

          {cr.status === "RISK_ASSESSMENT" && isChangeManagerRole && (
            <Card title="Submit risk assessment">
              <RiskAssessmentForm
                onSubmit={(input) => runAction(() => changeRequestsApi.submitRiskAssessment(cr.id, input))}
              />
            </Card>
          )}

          <Card title="People">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Requester</dt>
                <dd className="font-medium text-slate-800">{cr.requester.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Change manager</dt>
                <dd className="font-medium text-slate-800">{cr.changeManager?.name ?? "Unassigned"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Implementer</dt>
                <dd className="font-medium text-slate-800">{cr.implementer?.name ?? "Unassigned"}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-base font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
        variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"
      }`}
    >
      {children}
    </button>
  );
}
