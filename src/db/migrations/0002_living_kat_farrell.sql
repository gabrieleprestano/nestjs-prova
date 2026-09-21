ALTER TABLE "posts" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_slug_unique" UNIQUE("slug");