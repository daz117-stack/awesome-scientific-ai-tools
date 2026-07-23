import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { StatusPill } from "../components/common/StatusPill";
import { RiskBadge } from "../components/common/RiskBadge";
import * as changeRequestsApi from "../api/changeRequests";
import type { ChangeRequest, ChangeStatus } from "../types";
import { STATUS_LABELS } from "../utils/constants";

const STATUS_FILTERS: (ChangeStatus | "ALL")[] = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "RISK_ASSESSMENT",
  "CAB_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "IN_PROGRESS",
  "IMPLEMENTED",
  "CLOSED",
  "REJECTED",
  "CANCELLED",
];

export default function ChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [status, setStatus] = useState<ChangeStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    changeRequestsApi
      .listChangeRequests(status === "ALL" ? undefined : { status })
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <AppShell title="Change Requests">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                status === s ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              } border border-slate-200`}
            >
              {s === "ALL" ? "All" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <Link
          to="/change-requests/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + New Change Request
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Reference</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Type</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Risk</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Requester</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Planned Start</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  No change requests match this filter.
                </td>
              </tr>
            )}
            {requests.map((cr) => (
              <tr key={cr.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/change-requests/${cr.id}`} className="font-medium text-brand-600 hover:underline">
                    {cr.reference}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{cr.title}</td>
                <td className="px-4 py-3 text-slate-500">{cr.type}</td>
                <td className="px-4 py-3">
                  <RiskBadge level={cr.riskLevel} />
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={cr.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">{cr.requester.name}</td>
                <td className="px-4 py-3 text-slate-500">
                  {cr.plannedStart ? new Date(cr.plannedStart).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
