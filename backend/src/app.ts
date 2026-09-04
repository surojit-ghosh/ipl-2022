import express from "express";
import swaggerUi from "swagger-ui-express";

import { healthRouter } from "@/features/health/health.route";
import { matchesRouter } from "@/features/matches/matches.route";
import { playersRouter } from "@/features/players/players.route";
import { standingsRouter } from "@/features/standings/standings.route";
import { statsRouter } from "@/features/stats/stats.route";
import { teamsRouter } from "@/features/teams/teams.route";
import { venuesRouter } from "@/features/venues/venues.route";
import { ApiError, NotFoundError } from "@/lib/api-error";
import { errorResponseSchema, send } from "@/lib/response";
import { openapiDocument } from "@/openapi";

export const app = express();

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/openapi.json", (_req, res) => {
  res.json(openapiDocument);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use(healthRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/venues", venuesRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/standings", standingsRouter);
app.use("/api/stats", statsRouter);

app.use((_req, _res, next) => {
  next(new NotFoundError("Route"));
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof ApiError) {
      return send(
        res,
        errorResponseSchema,
        {
          error: {
            code: error.code,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        },
        error.statusCode,
      );
    }

    console.error(error);
    return send(
      res,
      errorResponseSchema,
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      500,
    );
  },
);
