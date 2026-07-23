import { useEffect, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import * as auditLogsApi from "../api/auditLogs";
import type { AuditLogEntry } from "../types";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [entityType, setEntityType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    auditLogsApi
      .listAuditLogs(entityType ? { entityType } : undefined)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [entityType]);

  return (
    <AppShell title="Audit Logs">
      <div className="mb-4 flex flex-wrap gap-2">
        {["", "ChangeRequest", "CabReview", "User"].map((t) => (
          <button
            key={t || "all"}
            onClick={() => setEntityType(t)}
            className={`rounded-full border border-slate-200 px-3 py-1 text-xs font-medium ${
              entityType === t ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t || "All entities"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Timestamp</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Entity</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Action</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Actor</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No audit events recorded.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {log.entityType} <span className="text-slate-400">#{log.entityId.slice(0, 8)}</span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{log.action}</td>
                <td className="px-4 py-3 text-slate-500">{log.actor?.name ?? "System"}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {log.changes ? JSON.stringify(log.changes) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
