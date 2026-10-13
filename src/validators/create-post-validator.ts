import { regions } from "@/data/constants";
import { gameModeEnum, roleEnum } from "@/db/schema";
import { z } from "zod";

const RankEnum = z.enum(
  [
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
  ],
  { message: "Rank is required" },
);

const RegionEnum = z.enum(regions, { message: "Region is required" });

const RoleEnum = z.enum(roleEnum.enumValues, { message: "Role is required" });

const GameModeEnum = z.enum(gameModeEnum.enumValues, { message: "Queue is required" });

export const createPostValidator = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Say who you are looking for")
    .max(280, "At most 280 characters"),
  role: RoleEnum,
  region: RegionEnum,
  rank: RankEnum,
  gameMode: GameModeEnum,
});

export type ValidatedRank = z.infer<typeof RankEnum>;
export type ValidatedRegion = z.infer<typeof RegionEnum>;
export type ValidatedRole = z.infer<typeof RoleEnum>;
