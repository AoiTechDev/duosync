import { regions } from "@/data/constants";
import { z } from "zod";

const RankEnum = z.enum([
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
], { message: "Rank is required" });

const RegionEnum = z.enum(regions, { message: "Region is required" });

const RoleEnum = z.object({
  id: z.enum(["top", "jungle", "mid", "adc", "support"], { message: "Role is required" }),
  name: z.string(),
}, { message: "Role is required" });

export const createFeedPostValidator = z.object({
  description: z.string().min(1, "Description is required"),
  role: RoleEnum,
  region: RegionEnum,
  rank: RankEnum,
});


export type ValidatedRank = z.infer<typeof RankEnum>;
export type ValidatedRegion = z.infer<typeof RegionEnum>;
export type ValidatedRole = z.infer<typeof RoleEnum>;
