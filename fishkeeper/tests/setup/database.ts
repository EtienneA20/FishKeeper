import { randomUUID } from 'node:crypto';
import { copyFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterAll, inject } from 'vitest';

import { toDatabaseUrl } from '../helpers/migrations';

// Runs before each test file: a private copy keeps parallel test files isolated.
// It must run before '@/lib/db' is imported, because the client reads DATABASE_URL once.
const templateDatabasePath = inject('templateDatabasePath');
const databasePath = join(dirname(templateDatabasePath), `${randomUUID()}.db`);

copyFileSync(templateDatabasePath, databasePath);
process.env.DATABASE_URL = toDatabaseUrl(databasePath);

afterAll(async () => {
    const globalForPrisma = globalThis as unknown as {
        prisma?: { $disconnect(): Promise<void> };
    };
    await globalForPrisma.prisma?.$disconnect();
    delete globalForPrisma.prisma;
    rmSync(databasePath, { force: true });
});
