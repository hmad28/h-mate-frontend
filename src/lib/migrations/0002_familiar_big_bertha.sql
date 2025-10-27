ALTER TABLE "user_profiles" ADD COLUMN "ai_summary" jsonb;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "summary_generated_at" timestamp;