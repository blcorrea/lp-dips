-- Enforce one affiliate per email address.
--
-- Context: Affiliate.email was previously non-unique, so the self-signup form
-- accepted the same email multiple times (a new row per distinct ref). This
-- adds a UNIQUE index. Postgres treats NULLs as distinct, so admin-created
-- affiliates without an email are unaffected (multiple NULLs remain allowed).
--
-- IMPORTANT: self-signup stores emails lowercased, but rows created before this
-- migration (or via the admin API) may contain mixed-case or duplicate emails.
-- Run the duplicate check below FIRST and resolve any rows it returns, otherwise
-- the CREATE UNIQUE INDEX will fail.
--
--   SELECT lower(email) AS email, count(*)
--   FROM "Affiliate"
--   WHERE email IS NOT NULL
--   GROUP BY lower(email)
--   HAVING count(*) > 1;
--
-- For each duplicate, keep the canonical affiliate (the one with commissions /
-- the earliest createdAt) and delete or re-point the extras before proceeding.

CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_email_key"
  ON "Affiliate"("email");
