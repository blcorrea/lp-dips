-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "influencerRef" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "landingPage" TEXT;

-- CreateIndex
CREATE INDEX "Order_influencerRef_idx" ON "Order"("influencerRef");
