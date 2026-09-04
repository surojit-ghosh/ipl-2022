import type { Response } from "express";
import { z } from "zod";

import { API_ERROR_CODES } from "@/lib/api-error";

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.enum(API_ERROR_CODES),
    message: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  page_size: z.number().int().positive().max(100),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
});

export function send<TSchema extends z.ZodType>(
  response: Response,
  schema: TSchema,
  body: z.input<TSchema>,
  statusCode = 200,
) {
  return response.status(statusCode).json(schema.parse(body));
}
