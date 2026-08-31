export function apiUrl(path: string) {
  const base = typeof window === "undefined" ? "http://backend:3001" : "";
  return `${base.replace(/\/$/, "")}${path}`;
}