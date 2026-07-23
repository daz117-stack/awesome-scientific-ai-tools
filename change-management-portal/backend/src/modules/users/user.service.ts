import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import type { Role } from "@prisma/client";
import { ApiError } from "../../utils/apiError";

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  department: true,
  active: true,
  createdAt: true,
} as const;

export async function listUsers(role?: Role) {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    select: userSelect,
    orderBy: { name: "asc" },
  });
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: Role;
  department?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("A user with this email already exists");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      department: input.department,
      passwordHash,
    },
    select: userSelect,
  });
}

export async function setUserActive(id: string, active: boolean) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("User not found");
  return prisma.user.update({ where: { id }, data: { active }, select: userSelect });
}
