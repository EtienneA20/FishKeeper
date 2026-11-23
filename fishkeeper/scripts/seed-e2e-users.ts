import { basename } from 'node:path';
import { hash } from 'bcryptjs';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';
import { EROLE } from '../constants/enum/role.enum';
import { createDatabaseFromMigrations } from '../tests/helpers/migrations';

const E2E_DATABASE_FILE = 'e2e.db';
const E2E_PASSWORD = 'Fishkeeper-test-123!';

const fixtures = [
    { name: 'User', email: 'user@example.test', role: EROLE.USER },
    { name: 'Admin', email: 'admin@example.test', role: EROLE.ADMIN },
    { name: 'Sudo', email: 'sudo@example.test', role: EROLE.SUDO },
];

async function main(): Promise<void> {
    const connectionString = process.env.DATABASE_URL;
    const databasePath = connectionString?.replace(/^file:/, '');
    // This script deletes the database: never let it touch anything but e2e.db.
    if (
        !connectionString ||
        !databasePath ||
        basename(databasePath) !== E2E_DATABASE_FILE
    ) {
        throw new Error(
            `DATABASE_URL must point to ${E2E_DATABASE_FILE} (got "${connectionString ?? ''}"). ` +
                'Run the E2E tests with "npm run test:e2e".'
        );
    }

    // Rebuilt from the SQL migrations on every run, so the CHECK constraints exist too.
    createDatabaseFromMigrations(databasePath);

    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: connectionString }),
    });
    try {
        const password = await hash(E2E_PASSWORD, 10);
        for (const fixture of fixtures) {
            await prisma.user.create({
                data: { ...fixture, password, departement: 'Tests' },
            });
        }
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
