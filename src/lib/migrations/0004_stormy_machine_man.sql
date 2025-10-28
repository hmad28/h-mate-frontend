ALTER TABLE "summary_ratings" DROP CONSTRAINT "summary_ratings_summary_id_user_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "summary_ratings" ALTER COLUMN "summary_id" DROP NOT NULL;