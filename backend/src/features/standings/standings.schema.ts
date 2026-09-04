import { z } from "zod";

const standingSchema = z.object({ position: z.number().int().positive() }).passthrough();
export const standingsResponseSchema = z.object({ data: z.array(standingSchema) });
