import type { Request, Response } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { recordAuditLog } from "../../middleware/auditLog";
import * as userService from "./user.service";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
  department: z.string().optional(),
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const role = req.query.role ? (req.query.role as Role) : undefined;
  const users = await userService.listUsers(role);
  res.json(users);
});

export const postUser = asyncHandler(async (req: Request, res: Response) => {
  const body = createUserSchema.safeParse(req.body);
  if (!body.success) {
    throw ApiError.badRequest("Invalid user payload", body.error.flatten());
  }
  const user = await userService.createUser(body.data);
  await recordAuditLog({
    entityType: "User",
    entityId: user.id,
    action: "CREATED",
    actorId: req.user?.id,
    changes: { role: user.role, email: user.email },
  });
  res.status(201).json(user);
});

export const patchUserActive = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({ active: z.boolean() });
  const body = schema.safeParse(req.body);
  if (!body.success) {
    throw ApiError.badRequest("Invalid payload", body.error.flatten());
  }
  const user = await userService.setUserActive(req.params.id, body.data.active);
  await recordAuditLog({
    entityType: "User",
    entityId: user.id,
    action: body.data.active ? "ACTIVATED" : "DEACTIVATED",
    actorId: req.user?.id,
  });
  res.json(user);
});
