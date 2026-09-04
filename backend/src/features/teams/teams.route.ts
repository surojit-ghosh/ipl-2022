import { Router } from "express";

import { getTeam, getTeams, getTeamStats } from "./teams.controller";

export const teamsRouter = Router();

teamsRouter.get("/", getTeams);
teamsRouter.get("/:id/stats", getTeamStats);
teamsRouter.get("/:id", getTeam);
