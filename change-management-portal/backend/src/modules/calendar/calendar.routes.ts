import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getCalendarEvents } from "./calendar.controller";

export const calendarRouter = Router();

calendarRouter.use(requireAuth);
calendarRouter.get("/", getCalendarEvents);
