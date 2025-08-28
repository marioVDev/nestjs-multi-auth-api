-- AlterTable
ALTER TABLE "public"."apps" ALTER COLUMN "allowedProviders" SET DEFAULT ARRAY['google', 'github', 'local']::TEXT[];
