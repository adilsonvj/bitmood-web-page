import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const runtimeRoot = path.join(projectRoot, ".sites-runtime");
const vinextCli = path.join(projectRoot, "node_modules", "vinext", "dist", "cli.js");

function duration(value, fallback) {
  if (!value) return fallback;
  const match = /^(\d+)(ms|s|m)?$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration: ${value}`);
  const factors = { ms: 1, s: 1_000, m: 60_000 };
  return Number(match[1]) * factors[match[2] || "ms"];
}

await Promise.all([
  mkdir(path.join(runtimeRoot, "wrangler", "logs"), { recursive: true }),
  mkdir(path.join(projectRoot, ".wrangler"), { recursive: true }),
]);

const timeoutMs = duration(process.env.SITES_BUILD_TIMEOUT, 3 * 60_000);
const killAfterMs = duration(process.env.SITES_BUILD_KILL_AFTER, 10_000);
const env = {
  ...process.env,
  SITES_PROJECT_ROOT: projectRoot,
  WRANGLER_WRITE_LOGS: process.env.WRANGLER_WRITE_LOGS || "false",
  WRANGLER_LOG_PATH:
    process.env.WRANGLER_LOG_PATH || path.join(runtimeRoot, "wrangler", "logs"),
  MINIFLARE_REGISTRY_PATH:
    process.env.MINIFLARE_REGISTRY_PATH || path.join(runtimeRoot, "wrangler", "registry"),
};

console.log(`Running bounded vinext build (${Math.round(timeoutMs / 1_000)}s)...`);

const child = spawn(process.execPath, [vinextCli, "build"], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
});

let timedOut = false;
const timeout = setTimeout(() => {
  timedOut = true;
  console.error(`vinext build exceeded ${Math.round(timeoutMs / 1_000)}s; terminating.`);
  child.kill("SIGTERM");
  setTimeout(() => child.kill("SIGKILL"), killAfterMs).unref();
}, timeoutMs);

child.once("error", (error) => {
  clearTimeout(timeout);
  console.error(error);
  process.exitCode = 1;
});

child.once("exit", (code, signal) => {
  clearTimeout(timeout);
  if (timedOut) process.exitCode = 124;
  else if (signal) process.exitCode = 1;
  else process.exitCode = code ?? 1;
});
