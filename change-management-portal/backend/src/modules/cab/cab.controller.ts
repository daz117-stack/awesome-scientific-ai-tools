import type { Request, Response } from "express";
import { z } from "zod";
import { CabVoteDecision } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import * as cabService from "./cab.service";

export const getPendingReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await cabService.listPendingReviews();
  res.json(reviews);
});

export const getReviewById = asyncHandler(async (req: Request, res: Response) => {
  const review = await cabService.getReview(req.params.id);
  res.json(review);
});

const voteSchema = z.object({
  decision: z.nativeEnum(CabVoteDecision),
  comment: z.string().optional(),
});

export const postVote = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const body = voteSchema.safeParse(req.body);
  if (!body.success) throw ApiError.badRequest("Invalid vote payload", body.error.flatten());
  const review = await cabService.castVote(req.params.id, req.user.id, body.data.decision, body.data.comment);
  res.json(review);
});
