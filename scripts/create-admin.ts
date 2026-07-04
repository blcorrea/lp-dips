/**
 * Create (or update) an admin user from the command line.
 *
 * Useful for bootstrapping the first SUPER_ADMIN, or resetting a password
 * without going through the dashboard. Idempotent by email: an existing user
 * is updated (name/role/password), a new one is created.
 *
 * Run with:
 *   npx tsx scripts/create-admin.ts --email you@dips.com --name "You" --password "secret123" --role SUPER_ADMIN
 *
 * Flags:
 *   --email     (required) login email
 *   --name      (required) display name
 *   --password  (required) plaintext password, min 8 chars
 *   --role      SUPER_ADMIN | OPERATOR   (default: SUPER_ADMIN)
 *
 * Requires DATABASE_URL in the env.
 */
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/password';

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const email    = (arg('email') ?? '').trim().toLowerCase();
  const name     = (arg('name') ?? '').trim();
  const password = arg('password') ?? '';
  const roleArg  = (arg('role') ?? 'SUPER_ADMIN').toUpperCase();
  const role     = roleArg === 'OPERATOR' ? 'OPERATOR' : 'SUPER_ADMIN';

  if (!email || !name || password.length < 8) {
    console.error(
      'Usage: npx tsx scripts/create-admin.ts --email <email> --name <name> --password <min 8 chars> [--role SUPER_ADMIN|OPERATOR]'
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.adminUser.upsert({
    where:  { email },
    update: { name, role, passwordHash, active: true },
    create: { email, name, role, passwordHash },
  });

  console.log(`✓ Admin ready: ${user.email} (${user.role})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
