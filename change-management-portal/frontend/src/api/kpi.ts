import { apiClient } from "./client";
import type { KpiSummary } from "../types";

export async function getKpiSummary(days = 90) {
  const { data } = await apiClient.get<KpiSummary>("/kpi/summary", { params: { days } });
  return data;
}
