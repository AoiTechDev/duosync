import { RoleOption } from "@/data/preferences";
import { Region } from "@/db/schema";

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

export type Role = Pick<RoleOption, "id" | "name">;

export type CreatePostFormData = {
  description: string | null;
  role: Role | null;
  region: Region | null;
  rank: Rank | null;
};
