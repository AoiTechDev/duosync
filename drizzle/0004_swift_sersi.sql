CREATE TYPE "public"."rank_min" AS ENUM('IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER');--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "region" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "region" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."region";--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('NA1', 'EUW1', 'EUN1', 'KR', 'BR1', 'LA1', 'LA2');--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "region" SET DATA TYPE "public"."region" USING "region"::"public"."region";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "region" SET DATA TYPE "public"."region" USING "region"::"public"."region";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "rank_min" "rank_min" NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "looking_for";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "rank_range";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "game_mode";