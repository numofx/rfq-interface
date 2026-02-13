#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const args = process.argv
  .slice(2)
  .map((arg) => (arg === "--turbopack" ? "--turbo" : arg));

let nextBin;
try {
  nextBin = require.resolve("next/dist/bin/next");
} catch (error) {
  console.error("Could not resolve Next.js CLI. Run `bun install` first.");
  process.exit(1);
}

const result = spawnSync(process.execPath, [nextBin, ...args], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
