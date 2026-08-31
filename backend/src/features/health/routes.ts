import { Router } from "express";

import { database } from "@/lib/db";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

healthRouter.get("/ready", async (_req, res) => {
  try {
    await database().$queryRaw`SELECT 1`;
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not_ready" });
  }
});
