ALTER TABLE "users" ADD COLUMN "solo_rank" "rank";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "flex_rank" "rank";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "current_rank";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "peak_rank";