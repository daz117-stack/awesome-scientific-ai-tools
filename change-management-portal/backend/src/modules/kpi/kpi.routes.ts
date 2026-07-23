import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getKpiSummary } from "./kpi.controller";

export const kpiRouter = Router();

kpiRouter.use(requireAuth);
kpiRouter.get("/summary", getKpiSummary);
