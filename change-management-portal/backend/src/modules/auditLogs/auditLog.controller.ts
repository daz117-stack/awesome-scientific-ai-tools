import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { prisma } from "../../config/db";

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const entityType = req.query.entityType as string | undefined;
  const entityId = req.query.entityId as string | undefined;
  const take = req.query.take ? Number(req.query.take) : 100;

  const logs = await prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: { actor: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(take) && take > 0 ? Math.min(take, 500) : 100,
  });

  res.json(logs);
});
