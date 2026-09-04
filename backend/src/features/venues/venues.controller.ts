import type { RequestHandler } from "express";

import { NotFoundError } from "@/lib/api-error";
import { send } from "@/lib/response";
import { parseRequest } from "@/lib/validation";

import {
  venueIdParamsSchema,
  venueListResponseSchema,
  venueResponseSchema,
  venueStatsResponseSchema,
} from "./venues.schema";
import { findVenue, listVenues, venueExists, venueStats } from "./venues.service";

export const getVenues: RequestHandler = async (_req, res) => {
  send(res, venueListResponseSchema, { data: await listVenues() });
};

export const getVenue: RequestHandler = async (req, res) => {
  const { id } = parseRequest(venueIdParamsSchema, req.params);
  const venue = await findVenue(id);
  if (!venue) throw new NotFoundError("Venue");
  send(res, venueResponseSchema, venue);
};

export const getVenueStats: RequestHandler = async (req, res) => {
  const { id } = parseRequest(venueIdParamsSchema, req.params);
  if (!(await venueExists(id))) throw new NotFoundError("Venue");
  send(res, venueStatsResponseSchema, await venueStats(id));
};
