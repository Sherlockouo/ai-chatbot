CREATE TABLE IF NOT EXISTS "Provider" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"provider_name" varchar NOT NULL,
	"provider_type" varchar DEFAULT 'openai' NOT NULL,
	"api_key" text DEFAULT '',
	"base_url" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"models" json
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
