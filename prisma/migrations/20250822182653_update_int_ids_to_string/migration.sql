/*
  Warnings:

  - The primary key for the `App` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_AppToClients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_AppToUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."_AppToClients" DROP CONSTRAINT "_AppToClients_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AppToUsers" DROP CONSTRAINT "_AppToUsers_A_fkey";

-- AlterTable
ALTER TABLE "public"."App" DROP CONSTRAINT "App_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "clientId" SET DATA TYPE TEXT,
ADD CONSTRAINT "App_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."_AppToClients" DROP CONSTRAINT "_AppToClients_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_AppToClients_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "public"."_AppToUsers" DROP CONSTRAINT "_AppToUsers_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_AppToUsers_AB_pkey" PRIMARY KEY ("A", "B");

-- AddForeignKey
ALTER TABLE "public"."_AppToClients" ADD CONSTRAINT "_AppToClients_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AppToUsers" ADD CONSTRAINT "_AppToUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
