import express from "express";

import { healthRouter } from "@/features/health/routes";
import { matchesRouter } from "@/features/matches/routes";
import { playersRouter } from "@/features/players/routes";
import { standingsRouter } from "@/features/standings/routes";
import { statsRouter } from "@/features/stats/routes";
import { teamsRouter } from "@/features/teams/routes";
import { venuesRouter } from "@/features/venues/routes";

export const app = express();

app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(healthRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/venues", venuesRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/standings", standingsRouter);
app.use("/api/stats", statsRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});
