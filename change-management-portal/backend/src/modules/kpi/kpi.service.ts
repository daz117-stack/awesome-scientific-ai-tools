import { ChangeStatus } from "@prisma/client";
import { prisma } from "../../config/db";

export async function getKpiSummary(sinceDays: number) {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

  const [total, byStatus, byRisk, byType, closed, rejected, emergency] = await Promise.all([
    prisma.changeRequest.count({ where: { createdAt: { gte: since } } }),
    prisma.changeRequest.groupBy({
      by: ["status"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.changeRequest.groupBy({
      by: ["riskLevel"],
      where: { createdAt: { gte: since }, riskLevel: { not: null } },
      _count: { _all: true },
    }),
    prisma.changeRequest.groupBy({
      by: ["type"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.changeRequest.findMany({
      where: { status: ChangeStatus.CLOSED, closedAt: { gte: since }, submittedAt: { not: null } },
      select: { submittedAt: true, closedAt: true },
    }),
    prisma.changeRequest.count({
      where: { createdAt: { gte: since }, status: ChangeStatus.REJECTED },
    }),
    prisma.changeRequest.count({
      where: { createdAt: { gte: since }, type: "EMERGENCY" },
    }),
  ]);

  const leadTimes = closed
    .filter((c) => c.submittedAt && c.closedAt)
    .map((c) => (c.closedAt!.getTime() - c.submittedAt!.getTime()) / (1000 * 60 * 60));
  const avgLeadTimeHours = leadTimes.length
    ? Math.round((leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) * 10) / 10
    : 0;

  const closedCount = byStatus.find((s) => s.status === ChangeStatus.CLOSED)?._count._all ?? 0;
  const successRate = total > 0 ? Math.round((closedCount / total) * 1000) / 10 : 0;

  return {
    windowDays: sinceDays,
    totalChangeRequests: total,
    successRate,
    avgLeadTimeHours,
    emergencyChangeCount: emergency,
    rejectedCount: rejected,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    byRiskLevel: byRisk.map((r) => ({ riskLevel: r.riskLevel, count: r._count._all })),
    byType: byType.map((t) => ({ type: t.type, count: t._count._all })),
  };
}
