import { Router } from "express";

import { database } from "@/lib/db";

export const standingsRouter = Router();

standingsRouter.get("/", async (_req, res, next) => {
  try {
    const standings = await database().standing.findMany({
      orderBy: { position: "asc" },
      include: { team: true, season: true },
    });
    res.json({ data: standings });
  } catch (error) {
    next(error);
  }
});
