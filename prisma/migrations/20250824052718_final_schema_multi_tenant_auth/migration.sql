/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `App` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AppToClients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AppToUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AppToClients" DROP CONSTRAINT "_AppToClients_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AppToClients" DROP CONSTRAINT "_AppToClients_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AppToUsers" DROP CONSTRAINT "_AppToUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AppToUsers" DROP CONSTRAINT "_AppToUsers_B_fkey";

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."App";

-- DropTable
DROP TABLE "public"."Clients";

-- DropTable
DROP TABLE "public"."Users";

-- DropTable
DROP TABLE "public"."_AppToClients";

-- DropTable
DROP TABLE "public"."_AppToUsers";

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_accounts" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."apps" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "jwtSecret" TEXT NOT NULL,
    "jwtExpiresIn" TEXT NOT NULL DEFAULT '24h',
    "allowedProviders" TEXT[] DEFAULT ARRAY['google', 'github']::TEXT[],
    "callbackUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "public"."clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_appId_key" ON "public"."users"("email", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "client_accounts_provider_providerAccountId_key" ON "public"."client_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "client_accounts_clientId_providerAccountId_key" ON "public"."client_accounts"("clientId", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_provider_providerAccountId_key" ON "public"."user_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_userId_providerAccountId_key" ON "public"."user_accounts"("userId", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "apps_jwtSecret_key" ON "public"."apps"("jwtSecret");

-- CreateIndex
CREATE UNIQUE INDEX "apps_clientId_name_key" ON "public"."apps"("clientId", "name");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_accounts" ADD CONSTRAINT "client_accounts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_accounts" ADD CONSTRAINT "user_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."apps" ADD CONSTRAINT "apps_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
