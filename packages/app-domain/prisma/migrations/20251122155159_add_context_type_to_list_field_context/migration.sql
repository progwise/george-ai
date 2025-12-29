-- CreateEnum
CREATE TYPE "public"."AiListFieldContextType" AS ENUM ('fieldReference', 'vectorSearch', 'webFetch');

-- AlterTable
ALTER TABLE "public"."AiListFieldContext" ADD COLUMN     "contextType" "public"."AiListFieldContextType" NOT NULL DEFAULT 'fieldReference';
