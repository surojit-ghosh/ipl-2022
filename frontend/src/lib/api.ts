export function apiUrl(path: string) {
  const base = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "http://backend:3001") : "";
  return `${base.replace(/\/$/, "")}${path}`;
}