import type { RequestHandler } from "express";

import { send } from "@/lib/response";

import { standingsResponseSchema } from "./standings.schema";
import { getStandings } from "./standings.service";

export const listStandings: RequestHandler = async (_req, res) => {
  send(res, standingsResponseSchema, { data: await getStandings() });
};
