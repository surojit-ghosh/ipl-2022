export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function apiUrl(path: string) {
  const base =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_URL || "http://backend:3001"
      : "";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code: string | undefined;

    try {
      const payload = await response.json();
      const error = payload?.error;
      if (typeof error?.message === "string") message = error.message;
      if (typeof error?.code === "string") code = error.code;
    } catch {
      // The API usually returns structured JSON errors; keep the HTTP status fallback.
    }

    throw new ApiError(message, response.status, code);
  }

  return response.json();
}
