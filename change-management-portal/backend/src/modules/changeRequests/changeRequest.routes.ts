import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import {
  getChangeRequestById,
  getChangeRequests,
  patchChangeRequest,
  postCancel,
  postChangeRequest,
  postClose,
  postComment,
  postComplete,
  postRiskAssessment,
  postSchedule,
  postStart,
  postSubmit,
  postTriage,
} from "./changeRequest.controller";

export const changeRequestRouter = Router();

changeRequestRouter.use(requireAuth);

changeRequestRouter.get("/", getChangeRequests);
changeRequestRouter.get("/:id", getChangeRequestById);
changeRequestRouter.post(
  "/",
  requireRole(Role.REQUESTER, Role.CHANGE_MANAGER, Role.ADMIN),
  postChangeRequest
);
changeRequestRouter.patch(
  "/:id",
  requireRole(Role.REQUESTER, Role.CHANGE_MANAGER, Role.ADMIN),
  patchChangeRequest
);

changeRequestRouter.post(
  "/:id/submit",
  requireRole(Role.REQUESTER, Role.CHANGE_MANAGER, Role.ADMIN),
  postSubmit
);
changeRequestRouter.post(
  "/:id/triage",
  requireRole(Role.CHANGE_MANAGER, Role.ADMIN),
  postTriage
);
changeRequestRouter.post(
  "/:id/risk-assessment",
  requireRole(Role.CHANGE_MANAGER, Role.ADMIN),
  postRiskAssessment
);
changeRequestRouter.post(
  "/:id/schedule",
  requireRole(Role.CHANGE_MANAGER, Role.ADMIN),
  postSchedule
);
changeRequestRouter.post(
  "/:id/start",
  requireRole(Role.IMPLEMENTER, Role.CHANGE_MANAGER, Role.ADMIN),
  postStart
);
changeRequestRouter.post(
  "/:id/complete",
  requireRole(Role.IMPLEMENTER, Role.CHANGE_MANAGER, Role.ADMIN),
  postComplete
);
changeRequestRouter.post(
  "/:id/close",
  requireRole(Role.CHANGE_MANAGER, Role.ADMIN),
  postClose
);
changeRequestRouter.post(
  "/:id/cancel",
  requireRole(Role.REQUESTER, Role.CHANGE_MANAGER, Role.ADMIN),
  postCancel
);
changeRequestRouter.post("/:id/comments", postComment);
