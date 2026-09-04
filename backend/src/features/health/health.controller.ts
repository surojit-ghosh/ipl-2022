import type { RequestHandler } from "express";

import { send } from "@/lib/response";

import { healthResponseSchema, readinessResponseSchema } from "./health.schema";
import { isDatabaseReady } from "./health.service";

export const getHealth: RequestHandler = (_req, res) => {
  send(res, healthResponseSchema, { status: "ok" });
};

export const getReadiness: RequestHandler = async (_req, res) => {
  try {
    await isDatabaseReady();
    send(res, readinessResponseSchema, { status: "ready" });
  } catch {
    send(res, readinessResponseSchema, { status: "not_ready" }, 503);
  }
};
