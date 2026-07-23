import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import * as notificationService from "./notification.service";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const unreadOnly = req.query.unread === "true";
  const notifications = await notificationService.listNotifications(req.user.id, unreadOnly);
  res.json(notifications);
});

export const patchNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await notificationService.markNotificationRead(req.user.id, req.params.id);
  res.status(204).send();
});

export const postMarkAllRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await notificationService.markAllNotificationsRead(req.user.id);
  res.status(204).send();
});
