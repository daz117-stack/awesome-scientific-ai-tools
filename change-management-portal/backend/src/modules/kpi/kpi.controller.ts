import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as kpiService from "./kpi.service";

export const getKpiSummary = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : 90;
  const summary = await kpiService.getKpiSummary(Number.isFinite(days) && days > 0 ? days : 90);
  res.json(summary);
});
