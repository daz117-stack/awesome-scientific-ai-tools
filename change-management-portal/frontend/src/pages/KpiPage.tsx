import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/common/Card";
import * as kpiApi from "../api/kpi";
import type { KpiSummary } from "../types";
import { STATUS_LABELS } from "../utils/constants";

const RISK_CHART_COLORS: Record<string, string> = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export default function KpiPage() {
  const [days, setDays] = useState(90);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);

  useEffect(() => {
    kpiApi.getKpiSummary(days).then(setKpi);
  }, [days]);

  return (
    <AppShell title="KPI Dashboard">
      <div className="mb-4 flex justify-end gap-2">
        {[30, 90, 180, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-full px-3 py-1 text-xs font-medium border border-slate-200 ${
              days === d ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Last {d}d
          </button>
        ))}
      </div>

      {!kpi && <p className="text-sm text-slate-400">Loading…</p>}

      {kpi && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatTile label="Total change requests" value={kpi.totalChangeRequests} />
            <StatTile label="Success rate" value={`${kpi.successRate}%`} />
            <StatTile label="Avg. lead time" value={`${kpi.avgLeadTimeHours}h`} />
            <StatTile label="Emergency changes" value={kpi.emergencyChangeCount} />
            <StatTile label="Rejected" value={kpi.rejectedCount} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Change requests by status">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpi.byStatus.map((s) => ({ name: STATUS_LABELS[s.status], count: s.count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={70} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3862f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Risk distribution">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kpi.byRiskLevel.map((r) => ({ name: r.riskLevel ?? "Unassessed", value: r.count }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {kpi.byRiskLevel.map((r) => (
                        <Cell key={r.riskLevel ?? "none"} fill={RISK_CHART_COLORS[r.riskLevel ?? ""] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Change requests by type">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpi.byType.map((t) => ({ name: t.type, count: t.count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2544d6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
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
