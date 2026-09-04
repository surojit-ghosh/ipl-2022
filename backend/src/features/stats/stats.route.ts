import { Router } from "express";

import {
  getBattingStats,
  getBowlingStats,
  getStatsSummary,
  getTeamStats,
  getVenueStats,
} from "./stats.controller";

export const statsRouter = Router();

statsRouter.get("/batting", getBattingStats);
statsRouter.get("/bowling", getBowlingStats);
statsRouter.get("/teams", getTeamStats);
statsRouter.get("/summary", getStatsSummary);
statsRouter.get("/venues", getVenueStats);
