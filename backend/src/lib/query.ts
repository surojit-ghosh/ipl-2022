import type { Request } from "express";
import { z } from "zod";

export class RequestValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

function queryText(value: unknown, label: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new RequestValidationError(`${label} must be a single value`);
  }
  return value.trim();
}

export function numberQuery(
  value: unknown,
  label = "query parameter",
  options: { min?: number } = {},
): number | undefined {
  const text = queryText(value, label);
  if (text === undefined) return undefined;
  const result = z.coerce.number().int().safeParse(text);
  if (!result.success || (options.min !== undefined && result.data < options.min)) {
    const range = options.min === undefined ? "an integer" : `an integer >= ${options.min}`;
    throw new RequestValidationError(`${label} must be ${range}`);
  }
  return result.data;
}

export function enumQuery<T extends string>(
  value: unknown,
  values: readonly T[],
  label: string,
  fallback: T,
): T {
  const text = queryText(value, label);
  if (text === undefined) return fallback;
  if (!values.includes(text as T)) {
    throw new RequestValidationError(`${label} must be one of: ${values.join(", ")}`);
  }
  return text as T;
}

export function stringQuery(value: unknown, label: string): string | undefined {
  return queryText(value, label);
}

export function pathId(value: unknown): number | null {
  const number = numberQuery(value, "id");
  return number !== undefined && number > 0 ? number : null;
}

export function validTimezone(value: string | null): string | null {
  if (!value) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return value;
  } catch {
    return null;
  }
}

export function pagedQuery(query: Request["query"]) {
  const page = numberQuery(query.page, "page", { min: 1 }) ?? 1;
  const pageSize = numberQuery(query.page_size, "page_size", { min: 1 }) ?? 20;
  if (pageSize > 100) {
    throw new RequestValidationError("page_size must be an integer <= 100");
  }
  return { page, pageSize };
}

export function orderQuery(value: unknown): "asc" | "desc" {
  return enumQuery(value, ["asc", "desc"] as const, "order", "asc");
}
