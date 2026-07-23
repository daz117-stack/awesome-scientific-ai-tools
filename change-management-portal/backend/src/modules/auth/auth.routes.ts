import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getMe, postLogin } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", postLogin);
authRouter.get("/me", requireAuth, getMe);
