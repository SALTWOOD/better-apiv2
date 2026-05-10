-- CreateEnum
CREATE TYPE "VersionChannel" AS ENUM ('FRARM64', 'FRX64', 'SRARM64', 'SRX64');

-- CreateEnum
CREATE TYPE "ButtonCommand" AS ENUM ('OPEN_URL', 'OPEN_WEBPAGE');

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_buttons" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "command" "ButtonCommand" NOT NULL,
    "commandParameter" TEXT NOT NULL,
    "announcementId1" TEXT,
    "announcementId2" TEXT,

    CONSTRAINT "announcement_buttons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_assets" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "channel" "VersionChannel" NOT NULL,
    "versionName" TEXT NOT NULL,
    "versionCode" INTEGER NOT NULL,
    "updateTime" TIMESTAMP(3) NOT NULL,
    "downloads" TEXT NOT NULL,
    "patches" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "changelog" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "update_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caches" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "announcement_buttons_announcementId1_key" ON "announcement_buttons"("announcementId1");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_buttons_announcementId2_key" ON "announcement_buttons"("announcementId2");

-- CreateIndex
CREATE UNIQUE INDEX "update_assets_fileName_key" ON "update_assets"("fileName");

-- CreateIndex
CREATE INDEX "update_assets_channel_idx" ON "update_assets"("channel");

-- CreateIndex
CREATE INDEX "update_assets_versionCode_idx" ON "update_assets"("versionCode");

-- CreateIndex
CREATE UNIQUE INDEX "caches_key_key" ON "caches"("key");

-- AddForeignKey
ALTER TABLE "announcement_buttons" ADD CONSTRAINT "announcement_buttons_announcementId1_fkey" FOREIGN KEY ("announcementId1") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_buttons" ADD CONSTRAINT "announcement_buttons_announcementId2_fkey" FOREIGN KEY ("announcementId2") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
