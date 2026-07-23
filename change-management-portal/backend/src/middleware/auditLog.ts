import { prisma } from "../config/db";

interface RecordAuditLogInput {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string;
  changes?: Record<string, unknown>;
}

export async function recordAuditLog(input: RecordAuditLogInput) {
  await prisma.auditLog.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actorId: input.actorId,
      changes: input.changes as never,
    },
  });
}
