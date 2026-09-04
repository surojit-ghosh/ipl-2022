import { z } from "zod";

import { ValidationError } from "@/lib/api-error";

export const positiveIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "must be a positive integer")
  .transform(Number);

export const optionalPositiveIntSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "must be a positive integer")
  .transform(Number)
  .optional();

export const optionalNonNegativeIntSchema = z
  .string()
  .regex(/^\d+$/, "must be a non-negative integer")
  .transform(Number)
  .optional();

export const optionalTextSchema = z.string().trim().min(1).optional();

export const paginationQuerySchema = z.object({
  page: optionalPositiveIntSchema.default(1),
  page_size: optionalPositiveIntSchema
    .pipe(z.number().max(100, "must be at most 100"))
    .default(20),
}).strict();

export function parseRequest<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const details = result.error.issues.reduce<Record<string, string[]>>((all, issue) => {
    const path = issue.path.join(".") || "request";
    (all[path] ??= []).push(issue.message);
    return all;
  }, {});
  throw new ValidationError("Request validation failed", details);
}
