/*
  Warnings:

  - You are about to drop the column `callbackUrls` on the `apps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."apps" DROP COLUMN "callbackUrls";
