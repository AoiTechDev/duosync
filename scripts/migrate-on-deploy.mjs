// Runs pending Drizzle migrations during Vercel production builds, so a deploy can't ship
// code that expects schema the production database doesn't have yet.
// Preview and local builds skip it: they may point at a shared database, and unmerged
// migrations from a feature branch must not land there.
import { execSync } from "node:child_process";

if (process.env.VERCEL_ENV !== "production") {
  console.log(`[migrate] skipping (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"})`);
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error("[migrate] DATABASE_URL is not set for the production build; refusing to deploy.");
  process.exit(1);
}

console.log("[migrate] applying pending migrations...");
execSync("drizzle-kit migrate", { stdio: "inherit" });
