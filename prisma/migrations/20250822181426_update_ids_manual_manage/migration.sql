/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Clients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_AppToClients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_AppToUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AppToClients" DROP CONSTRAINT "_AppToClients_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AppToUsers" DROP CONSTRAINT "_AppToUsers_B_fkey";

-- AlterTable
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "clientId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."App" ALTER COLUMN "allowedProviders" SET DEFAULT ARRAY['google', 'github']::TEXT[];

-- AlterTable
ALTER TABLE "public"."Clients" DROP CONSTRAINT "Clients_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Clients_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Users" DROP CONSTRAINT "Users_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "appId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."_AppToClients" DROP CONSTRAINT "_AppToClients_AB_pkey",
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_AppToClients_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "public"."_AppToUsers" DROP CONSTRAINT "_AppToUsers_AB_pkey",
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_AppToUsers_AB_pkey" PRIMARY KEY ("A", "B");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AppToClients" ADD CONSTRAINT "_AppToClients_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AppToUsers" ADD CONSTRAINT "_AppToUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
