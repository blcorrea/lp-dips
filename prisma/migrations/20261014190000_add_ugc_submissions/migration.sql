-- CreateEnum
CREATE TYPE "UgcAuthorType" AS ENUM ('CUSTOMER', 'AFFILIATE');

-- CreateEnum
CREATE TYPE "UgcStatus" AS ENUM ('PENDING_UPLOAD', 'NEW', 'REVIEWED');

-- CreateEnum
CREATE TYPE "UgcVerdict" AS ENUM ('REPOST', 'REPOST_EDIT', 'REJECT');

-- CreateTable
CREATE TABLE "UgcSubmission" (
    "id" TEXT NOT NULL,
    "status" "UgcStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "authorType" "UgcAuthorType" NOT NULL,
    "affiliateId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instagram" TEXT,
    "orderEmail" TEXT,
    "locale" TEXT NOT NULL,
    "rightsTermsVersion" TEXT NOT NULL,
    "rightsAcceptedAt" TIMESTAMP(3) NOT NULL,
    "videoUrl" TEXT,
    "blobPath" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "verdict" "UgcVerdict",
    "score" DOUBLE PRECISION,
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewedAt" TIMESTAMP(3),
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UgcSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UgcSubmission_status_createdAt_idx" ON "UgcSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "UgcSubmission_ipHash_createdAt_idx" ON "UgcSubmission"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "UgcSubmission_affiliateId_idx" ON "UgcSubmission"("affiliateId");

-- AddForeignKey
ALTER TABLE "UgcSubmission" ADD CONSTRAINT "UgcSubmission_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

