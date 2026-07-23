import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/users/user.routes";
import { changeRequestRouter } from "./modules/changeRequests/changeRequest.routes";
import { cabRouter } from "./modules/cab/cab.routes";
import { calendarRouter } from "./modules/calendar/calendar.routes";
import { kpiRouter } from "./modules/kpi/kpi.routes";
import { auditLogRouter } from "./modules/auditLogs/auditLog.routes";
import { notificationRouter } from "./modules/notifications/notification.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(morgan("combined"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/change-requests", changeRequestRouter);
  app.use("/api/cab-reviews", cabRouter);
  app.use("/api/calendar", calendarRouter);
  app.use("/api/kpi", kpiRouter);
  app.use("/api/audit-logs", auditLogRouter);
  app.use("/api/notifications", notificationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
