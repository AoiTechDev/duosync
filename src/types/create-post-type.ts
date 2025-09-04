import { Region, Role } from "@/db/schema";

export type { Role };

export type Rank =
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER";

export type CreatePostFormData = {
  description: string | null;
  role: Role | null;
  region: Region | null;
  rank: Rank | null;
};
