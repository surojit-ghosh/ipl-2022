import { Router } from "express";

import { getHealth, getReadiness } from "./health.controller";

export const healthRouter = Router();

healthRouter.get("/health", getHealth);
healthRouter.get("/ready", getReadiness);
