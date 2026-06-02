CREATE TABLE IF NOT EXISTS "AffiliateLoginToken" (
  "id"          TEXT        NOT NULL,
  "affiliateId" TEXT        NOT NULL,
  "token"       TEXT        NOT NULL,
  "expiresAt"   TIMESTAMP(3) NOT NULL,
  "usedAt"      TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateLoginToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateLoginToken_token_key"
  ON "AffiliateLoginToken"("token");

CREATE INDEX IF NOT EXISTS "AffiliateLoginToken_token_idx"
  ON "AffiliateLoginToken"("token");

CREATE INDEX IF NOT EXISTS "AffiliateLoginToken_affiliateId_idx"
  ON "AffiliateLoginToken"("affiliateId");

ALTER TABLE "AffiliateLoginToken"
  DROP CONSTRAINT IF EXISTS "AffiliateLoginToken_affiliateId_fkey";

ALTER TABLE "AffiliateLoginToken"
  ADD CONSTRAINT "AffiliateLoginToken_affiliateId_fkey"
  FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
