import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { getAuditLogs } from "./auditLog.controller";

export const auditLogRouter = Router();

auditLogRouter.use(requireAuth);
auditLogRouter.get("/", requireRole(Role.AUDITOR, Role.ADMIN, Role.CHANGE_MANAGER), getAuditLogs);
