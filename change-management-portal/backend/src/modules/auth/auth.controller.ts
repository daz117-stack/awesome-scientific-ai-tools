import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import * as authService from "./auth.service";
import { prisma } from "../../config/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) {
    throw ApiError.badRequest("Invalid credentials payload", body.error.flatten());
  }
  const result = await authService.login(body.data.email, body.data.password);
  res.json(result);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, role: true, department: true },
  });
  if (!user) throw ApiError.notFound("User not found");
  res.json(user);
});
