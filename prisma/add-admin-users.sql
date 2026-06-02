CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id"           TEXT        NOT NULL,
  "email"        TEXT        NOT NULL,
  "passwordHash" TEXT        NOT NULL,
  "name"         TEXT,
  "active"       BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX IF NOT EXISTS "AdminUser_email_idx" ON "AdminUser"("email");
