import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { getUsers, patchUserActive, postUser } from "./user.controller";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get("/", getUsers);
userRouter.post("/", requireRole(Role.ADMIN), postUser);
userRouter.patch("/:id/active", requireRole(Role.ADMIN), patchUserActive);
