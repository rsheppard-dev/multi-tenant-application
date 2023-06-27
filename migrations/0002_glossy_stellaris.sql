CREATE TABLE IF NOT EXISTS "roles" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"application_id" uuid,
	"permissions" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_application_id" PRIMARY KEY("name","application_id");

CREATE UNIQUE INDEX IF NOT EXISTS "roles_id_index" ON "roles" ("id");
DO $$ BEGIN
 ALTER TABLE "roles" ADD CONSTRAINT "roles_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
