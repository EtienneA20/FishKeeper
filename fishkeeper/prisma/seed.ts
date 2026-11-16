import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {

    console.log('🌱 Début du peuplement de la base de données (Seeding)...')

    const catCharacides = await prisma.speciesCategory.upsert({
        where: { name: 'Characidés' },
        update: {},
        create: {
            name: 'Characidés',
            description: 'Poissons grégaires paisibles originaires d’Amérique du Sud.',
        },
    });

    const catCichlides = await prisma.speciesCategory.upsert({
        where: { name: 'Cichlidés agressifs' },
        update: {},
        create: {
            name: 'Cichlidés agressifs',
            description: 'Poissons territoriaux nécessitant de grands volumes.',
            incompatibleWith: {
                connect: [{ id: catCharacides.id }],
            },
        },
    });

    await prisma.species.upsert({
        where: { name: 'Néon bleu' },
        update: {},
        create: {
            name: 'Néon bleu',
            scientificName: 'Paracheirodon innesi',
            categoryId: catCharacides.id,
            description: 'Petit poisson de banc emblématique des bacs amazoniens.',
            waterType: 'FRESH_SOFT',
            minTemperature: 20,
            maxTemperature: 26,
            minPh: 5.5,
            maxPh: 7.0,
            minGh: 2,
            maxGh: 10,
            minKh: 1,
            maxKh: 5,
            minVolume: 60,
            aggressiveness: 'PEACEFUL',
        },
    });

    const existingTemplate = await prisma.maintenanceTemplate.findFirst({
        where: { title: 'Changement d’eau hebdomadaire' },
    });

    if (!existingTemplate) {
        await prisma.maintenanceTemplate.create({
            data: {
                title: 'Changement d’eau hebdomadaire',
                type: 'WATER_CHANGE',
                frequency: 'WEEKLY',
                interval: 1,
                waterPercent: 20,
                description: 'Renouvellement de 20% du volume net avec eau reposée ou osmosée.',
            },
        });
    }
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
    