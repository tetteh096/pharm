-- Add public-site fields to Branch so the website reads branches from the CMS.
ALTER TABLE "Branch" ADD COLUMN "tel" TEXT;
ALTER TABLE "Branch" ADD COLUMN "gps" TEXT;
ALTER TABLE "Branch" ADD COLUMN "maps" TEXT;
ALTER TABLE "Branch" ADD COLUMN "mapEmbed" TEXT;
ALTER TABLE "Branch" ADD COLUMN "accent" TEXT DEFAULT '#13ec8a';
ALTER TABLE "Branch" ADD COLUMN "comingSoon" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Branch" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
