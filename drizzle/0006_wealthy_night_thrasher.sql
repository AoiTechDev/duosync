CREATE TABLE "friend_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "friendship_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "likes" CASCADE;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_sender_id_receiver_id_unique";--> statement-breakpoint
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_sender_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_receiver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "friendships" ADD COLUMN "user_a_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "friendships" ADD COLUMN "user_b_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friend_requests_receiver_id_status_index" ON "friend_requests" USING btree ("receiver_id","status");--> statement-breakpoint
CREATE INDEX "friend_requests_sender_id_status_index" ON "friend_requests" USING btree ("sender_id","status");--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friendships_user_a_id_index" ON "friendships" USING btree ("user_a_id");--> statement-breakpoint
CREATE INDEX "friendships_user_b_id_index" ON "friendships" USING btree ("user_b_id");--> statement-breakpoint
ALTER TABLE "friendships" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "friendships" DROP COLUMN "sender_id";--> statement-breakpoint
ALTER TABLE "friendships" DROP COLUMN "receiver_id";--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_a_id_user_b_id_unique" UNIQUE("user_a_id","user_b_id");--> statement-breakpoint
ALTER TABLE "public"."friend_requests" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."friendship_status";--> statement-breakpoint
CREATE TYPE "public"."friendship_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED');--> statement-breakpoint
ALTER TABLE "public"."friend_requests" ALTER COLUMN "status" SET DATA TYPE "public"."friendship_status" USING "status"::"public"."friendship_status";