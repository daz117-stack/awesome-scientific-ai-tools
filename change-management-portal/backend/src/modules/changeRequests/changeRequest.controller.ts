import type { Request, Response } from "express";
import { z } from "zod";
import { ChangeStatus, ChangeType } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import * as changeRequestService from "./changeRequest.service";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  justification: z.string().min(1),
  type: z.nativeEnum(ChangeType),
  systemsAffected: z.array(z.string()).default([]),
  plannedStart: z.coerce.date().optional(),
  plannedEnd: z.coerce.date().optional(),
  implementationPlan: z.string().optional(),
  testPlan: z.string().optional(),
  backoutPlan: z.string().optional(),
});

const updateSchema = createSchema.partial();

const riskSchema = z.object({
  impact: z.number().int().min(1).max(5),
  probability: z.number().int().min(1).max(5),
  urgency: z.number().int().min(1).max(5),
  affectedUsers: z.number().int().min(0),
  downtimeMinutes: z.number().int().min(0),
  notes: z.string().optional(),
});

function requireUser(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

export const getChangeRequests = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as ChangeStatus | undefined;
  const type = req.query.type as ChangeType | undefined;
  const mine = req.query.mine === "true";
  const user = requireUser(req);
  const list = await changeRequestService.listChangeRequests({
    status,
    type,
    requesterId: mine ? user.id : undefined,
  });
  res.json(list);
});

export const getChangeRequestById = asyncHandler(async (req: Request, res: Response) => {
  const changeRequest = await changeRequestService.getChangeRequest(req.params.id);
  res.json(changeRequest);
});

export const postChangeRequest = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = createSchema.safeParse(req.body);
  if (!body.success) throw ApiError.badRequest("Invalid change request payload", body.error.flatten());
  const changeRequest = await changeRequestService.createChangeRequest({
    ...body.data,
    requesterId: user.id,
  });
  res.status(201).json(changeRequest);
});

export const patchChangeRequest = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = updateSchema.safeParse(req.body);
  if (!body.success) throw ApiError.badRequest("Invalid change request payload", body.error.flatten());
  const changeRequest = await changeRequestService.updateChangeRequest(req.params.id, user.id, body.data);
  res.json(changeRequest);
});

export const postSubmit = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const changeRequest = await changeRequestService.submitChangeRequest(req.params.id, user.id);
  res.json(changeRequest);
});

export const postTriage = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const schema = z.object({ changeManagerId: z.string().uuid().optional() });
  const body = schema.safeParse(req.body);
  if (!body.success) throw ApiError.badRequest("Invalid payload", body.error.flatten());
  const changeManagerId = body.data.changeManagerId ?? user.id;
  const changeRequest = await changeRequestService.triageChangeRequest(req.params.id, changeManagerId, user.id);
  res.json(changeRequest);
});

export const postRiskAssessment = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = riskSchema.safeParse(req.body);
  if (!body.success) throw ApiError.badRequest("Invalid risk assessment payload", body.error.flatten());
  const changeRequest = await changeRequestService.submitRiskAssessment(req.params.id, user.id, body.data);
  res.json(changeRequest);
});

export const postSchedule = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const schema = z.object({ implementerId: z.string().uuid().optional() });
  const body = schema.safeParse(req.body);
  if (!body.success) throw ApiError.badRequest("Invalid payload", body.error.flatten());
  const changeRequest = await changeRequestService.scheduleChangeRequest(
    req.params.id,
    user.id,
    body.data.implementerId
  );
  res.json(changeRequest);
});

export const postStart = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const changeRequest = await changeRequestService.startImplementation(req.params.id, user.id);
  res.json(changeRequest);
});

export const postComplete = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const changeRequest = await changeRequestService.completeImplementation(req.params.id, user.id);
  res.json(changeRequest);
});

export const postClose = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const changeRequest = await changeRequestService.closeChangeRequest(req.params.id, user.id);
  res.json(changeRequest);
});

export const postCancel = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const changeRequest = await changeRequestService.cancelChangeRequest(req.params.id, user.id);
  res.json(changeRequest);
});

export const postComment = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const schema = z.object({ body: z.string().min(1) });
  const body = schema.safeParse(req.body);
  if (!body.success) throw ApiError.badRequest("Invalid payload", body.error.flatten());
  const comment = await changeRequestService.addComment(req.params.id, user.id, body.data.body);
  res.status(201).json(comment);
});
