import { Router } from "express";

import { getVenue, getVenues, getVenueStats } from "./venues.controller";

export const venuesRouter = Router();

venuesRouter.get("/", getVenues);
venuesRouter.get("/:id/stats", getVenueStats);
venuesRouter.get("/:id", getVenue);
