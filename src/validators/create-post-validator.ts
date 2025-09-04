import { regions } from "@/data/constants";
import { roleEnum } from "@/db/schema";
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

const RoleEnum = z.enum(roleEnum.enumValues, { message: "Role is required" });

export const createPostValidator = z.object({
  description: z.string().min(1, "Description is required"),
  role: RoleEnum,
  region: RegionEnum,
  rank: RankEnum,
});


export type ValidatedRank = z.infer<typeof RankEnum>;
export type ValidatedRegion = z.infer<typeof RegionEnum>;
export type ValidatedRole = z.infer<typeof RoleEnum>;
