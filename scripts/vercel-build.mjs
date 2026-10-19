// Vercel build entry point. Vercel runs the `vercel-build` npm script instead
// of `build` when it exists, so local `npm run build` is unchanged.
//
// Production builds apply pending Prisma migrations BEFORE building. The build
// script used to be only `prisma generate && next build`, so merged migrations
// never reached the database and new code 500'd against the old schema.
//
// Only production migrates: preview deployments use the same Neon database as
// production, so letting a PR preview migrate would apply unmerged schema
// changes to live data. If the migration fails, the build fails and the
// previous production deployment keeps serving.
//
// Because migrations run before the new code is live, they must stay
// backward compatible with the code currently in production (add columns or
// tables first; drop or rename only in a later release).

import { execSync } from 'node:child_process';

function run(cmd, env = process.env) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env });
}

/**
 * Migrations take an advisory lock, which doesn't work reliably through
 * Neon's PgBouncer pooler. Prefer an explicit MIGRATE_DATABASE_URL; otherwise
 * derive Neon's direct host by dropping the "-pooler" suffix.
 */
function migrationUrl() {
  if (process.env.MIGRATE_DATABASE_URL) return process.env.MIGRATE_DATABASE_URL;
  const url = process.env.DATABASE_URL ?? '';
  return url.replace(/-pooler\./, '.');
}

const vercelEnv = process.env.VERCEL_ENV ?? 'local';

if (vercelEnv === 'production') {
  run('prisma migrate deploy', { ...process.env, DATABASE_URL: migrationUrl() });
} else {
  console.log(`Skipping prisma migrate deploy (VERCEL_ENV=${vercelEnv}).`);
}

run('prisma generate');
run('next build');
