-- AlterTable
ALTER TABLE "AffiliateCreative" ADD COLUMN     "captionEs" TEXT,
ADD COLUMN     "captionPt" TEXT,
ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateCreative_externalId_key" ON "AffiliateCreative"("externalId");
