import { prisma } from "../../config/db";
import type { NotificationType, Role } from "@prisma/client";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function notifyUser(input: CreateNotificationInput) {
  await prisma.notification.create({ data: input });
}

export async function notifyUsers(userIds: string[], input: Omit<CreateNotificationInput, "userId">) {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ ...input, userId })),
  });
}

export async function notifyRole(role: Role, input: Omit<CreateNotificationInput, "userId">) {
  const users = await prisma.user.findMany({ where: { role, active: true }, select: { id: true } });
  await notifyUsers(
    users.map((u) => u.id),
    input
  );
}

export async function listNotifications(userId: string, unreadOnly: boolean) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markNotificationRead(userId: string, id: string) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
