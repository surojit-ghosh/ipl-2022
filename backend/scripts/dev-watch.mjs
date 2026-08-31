import { spawn } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

async function stamp(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const parts = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return stamp(path);
      const info = await stat(path);
      return `${path}:${info.mtimeMs}:${info.size}`;
    }),
  );
  return parts.join("|");
}

let child;

function boot() {
  child?.kill("SIGTERM");
  child = spawn("pnpm", ["exec", "tsx", "src/server.ts"], { stdio: "inherit" });
}

let last = await stamp("src");
boot();

setInterval(async () => {
  const next = await stamp("src");
  if (next === last) return;
  last = next;
  console.log("file change, restart");
  boot();
}, 1000);
