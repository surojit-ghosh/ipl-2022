import { Router } from "express";

import { listStandings } from "./standings.controller";

export const standingsRouter = Router();

standingsRouter.get("/", listStandings);
