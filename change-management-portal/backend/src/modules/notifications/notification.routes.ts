import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getNotifications, patchNotificationRead, postMarkAllRead } from "./notification.controller";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/", getNotifications);
notificationRouter.post("/read-all", postMarkAllRead);
notificationRouter.patch("/:id/read", patchNotificationRead);
