UPDATE "posts" SET "expires_at" = "created_at" + interval '2 hours' WHERE "expires_at" IS NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "expires_at" SET DEFAULT now() + interval '2 hours';--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "bumped_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "posts" SET "bumped_at" = "created_at";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "game_mode" "game_mode" DEFAULT 'RANKED_SOLO' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp;
