ALTER TABLE "summary_ratings" DROP CONSTRAINT "summary_ratings_summary_id_career_summaries_id_fk";
--> statement-breakpoint
ALTER TABLE "summary_ratings" ADD CONSTRAINT "summary_ratings_summary_id_user_profiles_id_fk" FOREIGN KEY ("summary_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;