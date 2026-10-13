CREATE TYPE "public"."friendship_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."game_mode" AS ENUM('RANKED_SOLO', 'RANKED_FLEX', 'NORMAL', 'ARAM');--> statement-breakpoint
CREATE TYPE "public"."rank" AS ENUM('IRON_I', 'IRON_II', 'IRON_III', 'IRON_IV', 'BRONZE_I', 'BRONZE_II', 'BRONZE_III', 'BRONZE_IV', 'SILVER_I', 'SILVER_II', 'SILVER_III', 'SILVER_IV', 'GOLD_I', 'GOLD_II', 'GOLD_III', 'GOLD_IV', 'PLATINUM_I', 'PLATINUM_II', 'PLATINUM_III', 'PLATINUM_IV', 'EMERALD_I', 'EMERALD_II', 'EMERALD_III', 'EMERALD_IV', 'DIAMOND_I', 'DIAMOND_II', 'DIAMOND_III', 'DIAMOND_IV', 'MASTER', 'GRANDMASTER', 'CHALLENGER');--> statement-breakpoint
CREATE TYPE "public"."rank_min" AS ENUM('IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('NA1', 'EUW1', 'EUN1', 'KR', 'BR1', 'LA1', 'LA2');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT', 'FILL');--> statement-breakpoint
CREATE TABLE "accounts" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "friendship_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_a_id" uuid NOT NULL,
	"user_b_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_user_a_id_user_b_id_unique" UNIQUE("user_a_id","user_b_id"),
	CONSTRAINT "friendships_ordered_pair" CHECK ("friendships"."user_a_id" < "friendships"."user_b_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"rank_min" "rank_min" NOT NULL,
	"region" "region" NOT NULL,
	"role" "role" NOT NULL,
	"author_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"summoner_name" text,
	"region" "region",
	"solo_rank" "rank",
	"flex_rank" "rank",
	"main_role" "role",
	"secondary_role" "role",
	"bio" text,
	"avatar" text,
	"playstyle" json,
	"communication" json,
	"goals" json,
	"availability" json,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friend_requests_receiver_id_status_index" ON "friend_requests" USING btree ("receiver_id","status");--> statement-breakpoint
CREATE INDEX "friend_requests_sender_id_status_index" ON "friend_requests" USING btree ("sender_id","status");--> statement-breakpoint
CREATE INDEX "friendships_user_a_id_index" ON "friendships" USING btree ("user_a_id");--> statement-breakpoint
CREATE INDEX "friendships_user_b_id_index" ON "friendships" USING btree ("user_b_id");