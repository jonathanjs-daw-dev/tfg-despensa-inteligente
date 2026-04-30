-- AlterTable
ALTER TABLE "saved_recipes" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "estimated_time" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "image_url" TEXT;
