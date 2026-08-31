import type { Request } from "express";

export function numberQuery(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isInteger(number) ? number : undefined;
}

export function pathId(value: unknown): number | null {
  const number = numberQuery(value);
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
  const page = Math.max(numberQuery(query.page) ?? 1, 1);
  const pageSize = Math.min(Math.max(numberQuery(query.page_size) ?? 20, 1), 100);
  return { page, pageSize };
}

export function orderQuery(value: unknown): "asc" | "desc" {
  return value === "desc" ? "desc" : "asc";
}
