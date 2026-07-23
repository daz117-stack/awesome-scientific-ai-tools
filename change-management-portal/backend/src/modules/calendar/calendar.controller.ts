import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prisma } from "../../config/db";

const querySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const getCalendarEvents = asyncHandler(async (req: Request, res: Response) => {
  const query = querySchema.safeParse(req.query);
  if (!query.success) throw ApiError.badRequest("from and to query params are required", query.error.flatten());

  const events = await prisma.changeRequest.findMany({
    where: {
      plannedStart: { not: null },
      AND: [
        { plannedStart: { lte: query.data.to } },
        { plannedEnd: { gte: query.data.from } },
      ],
      status: { notIn: ["DRAFT", "CANCELLED", "REJECTED"] },
    },
    select: {
      id: true,
      reference: true,
      title: true,
      type: true,
      status: true,
      riskLevel: true,
      plannedStart: true,
      plannedEnd: true,
      systemsAffected: true,
    },
    orderBy: { plannedStart: "asc" },
  });

  res.json(events);
});
