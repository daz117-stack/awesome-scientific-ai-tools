import { apiClient } from "./client";
import type { AuditLogEntry } from "../types";

export async function listAuditLogs(params?: { entityType?: string; entityId?: string }) {
  const { data } = await apiClient.get<AuditLogEntry[]>("/audit-logs", { params });
  return data;
}
