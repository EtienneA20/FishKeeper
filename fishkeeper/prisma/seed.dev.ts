import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';
import { seedDevFixtures } from './seeds/dev-fixtures.seed';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🧪 Lancement du seed de développement (Fixtures de test)...');
    await seedDevFixtures(prisma);
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed de test :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
  