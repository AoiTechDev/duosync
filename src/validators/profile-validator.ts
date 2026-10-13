import { z } from "zod";
import { regions } from "@/data/constants";
import { roleEnum } from "@/db/schema";
import { COMMUNICATION_PREFERENCES, GOALS, PLAYSTYLE_TAGS } from "@/data/preferences";
import { normalizeUsername, USERNAME_PATTERN } from "@/lib/username";


export const usernameSchema = z
  .string()
  .transform(normalizeUsername)
  .pipe(
    z
      .string()
      .min(3, "At least 3 characters")
      .max(24, "At most 24 characters")
      .regex(USERNAME_PATTERN, "Only letters, numbers and _"),
  );

export const regionSchema = z.enum(regions as [string, ...string[]], { message: "Pick a region" });

const roleSchema = z
  .string()
  .transform((v) => v.toUpperCase())
  .pipe(z.enum(roleEnum.enumValues));

const idList = (ids: string[]) => z.array(z.enum(ids as [string, ...string[]])).max(ids.length);

export const completeProfileSchema = z.object({
  username: usernameSchema,
  region: regionSchema,
  mainRole: roleSchema,
  secondaryRole: roleSchema.nullish().or(z.literal("").transform(() => null)),
  playstyleTags: idList(PLAYSTYLE_TAGS.map((t) => t.id)).default([]),
  communication: idList(COMMUNICATION_PREFERENCES.map((c) => c.id)).default([]),
  goals: idList(GOALS.map((g) => g.id)).default([]),
  bio: z.string().trim().max(200).default(""),
});
