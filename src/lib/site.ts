export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.duogg.app").replace(/\/$/, "");
export const SITE_NAME = "DuoGG";
export const SITE_DESCRIPTION =
  "Find a League of Legends duo partner. Filter players by rank, role, region and queue, see verified ranks and connect to climb together.";
export const isProductionSite = () => process.env.VERCEL_ENV === "production";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@duogg.app";
export const OPERATOR_NAME = process.env.NEXT_PUBLIC_OPERATOR_NAME ?? "the DuoGG developer";
export const LEGAL_UPDATED = "14 October 2026";
