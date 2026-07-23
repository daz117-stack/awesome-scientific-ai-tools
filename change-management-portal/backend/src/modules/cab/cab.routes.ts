import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { getPendingReviews, getReviewById, postVote } from "./cab.controller";

export const cabRouter = Router();

cabRouter.use(requireAuth);
cabRouter.get("/", getPendingReviews);
cabRouter.get("/:id", getReviewById);
cabRouter.post("/:id/vote", requireRole(Role.CAB_MEMBER, Role.ADMIN), postVote);
