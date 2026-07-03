import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Resolve `@/*` → `./src/*` from tsconfig.json paths (native Vite support)
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      // Dummy values so modules that read env at import time (e.g. src/lib/prisma.ts,
      // transitively imported by src/lib/orders.ts) can load. Prisma connects lazily,
      // so no database connection is ever opened by unit tests.
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_never_connects',
      SESSION_SECRET: 'vitest-session-secret-for-unit-tests-only',
      // Legacy fallback secret — session.test.ts deletes/restores both to
      // exercise the SESSION_SECRET → ADMIN_SECRET fallback chain.
      ADMIN_SECRET: 'vitest-legacy-admin-secret-for-unit-tests-only',
    },
  },
});
