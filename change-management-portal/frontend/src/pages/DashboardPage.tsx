import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/common/Card";
import { StatusPill } from "../components/common/StatusPill";
import { RiskBadge } from "../components/common/RiskBadge";
import * as changeRequestsApi from "../api/changeRequests";
import * as kpiApi from "../api/kpi";
import { useAuth } from "../context/AuthContext";
import type { ChangeRequest, KpiSummary } from "../types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<ChangeRequest[]>([]);
  const [actionable, setActionable] = useState<ChangeRequest[]>([]);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [mine, active, summary] = await Promise.all([
        changeRequestsApi.listChangeRequests({ mine: true }),
        changeRequestsApi.listChangeRequests(),
        kpiApi.getKpiSummary(30),
      ]);
      setMyRequests(mine.slice(0, 5));
      setActionable(
        active
          .filter((cr) => ["SUBMITTED", "RISK_ASSESSMENT", "CAB_REVIEW"].includes(cr.status))
          .slice(0, 5)
      );
      setKpi(summary);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell title={`Welcome back, ${user?.name?.split(" ")[0] ?? ""}`}>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Open change requests (30d)" value={kpi?.totalChangeRequests ?? "—"} />
        <StatTile label="Success rate" value={kpi ? `${kpi.successRate}%` : "—"} />
        <StatTile label="Avg. lead time" value={kpi ? `${kpi.avgLeadTimeHours}h` : "—"} />
        <StatTile label="Emergency changes" value={kpi?.emergencyChangeCount ?? "—"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Needs attention"
          action={
            <Link to="/change-requests" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          }
        >
          {loading && <p className="text-sm text-slate-400">Loading…</p>}
          {!loading && actionable.length === 0 && (
            <p className="text-sm text-slate-400">Nothing pending triage, risk assessment, or CAB review.</p>
          )}
          <ul className="divide-y divide-slate-100">
            {actionable.map((cr) => (
              <li key={cr.id} className="py-3">
                <Link to={`/change-requests/${cr.id}`} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{cr.title}</p>
                    <p className="text-xs text-slate-500">
                      {cr.reference} · {cr.requester.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={cr.riskLevel} />
                    <StatusPill status={cr.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="My change requests"
          action={
            <Link to="/change-requests/new" className="text-xs font-medium text-brand-600 hover:underline">
              New request
            </Link>
          }
        >
          {loading && <p className="text-sm text-slate-400">Loading…</p>}
          {!loading && myRequests.length === 0 && (
            <p className="text-sm text-slate-400">You haven&apos;t submitted any change requests yet.</p>
          )}
          <ul className="divide-y divide-slate-100">
            {myRequests.map((cr) => (
              <li key={cr.id} className="py-3">
                <Link to={`/change-requests/${cr.id}`} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{cr.title}</p>
                    <p className="text-xs text-slate-500">{cr.reference}</p>
                  </div>
                  <StatusPill status={cr.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
