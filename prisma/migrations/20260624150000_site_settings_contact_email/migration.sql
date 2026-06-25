-- Add an editable public contact email to site settings.
ALTER TABLE "SiteSettings" ADD COLUMN "contactEmail" TEXT;
