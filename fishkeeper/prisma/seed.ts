import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';
import { seedCategories, type RawCategory, type RawIncompatibility } from './seeds/category.seed';
import { seedSpecies, type RawSpecies } from './seeds/species.seed';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

interface FinalDataset {
    metadata: {
        project: string;
        generatedAt: string;
        totalCategories: number;
        totalSpecies: number;
        totalIncompatibilityRules: number;
    };
    categories: RawCategory[];
    categoryIncompatibilities: RawIncompatibility[];
    species: RawSpecies[];
}

async function seedMaintenanceTemplates() {
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
        console.log('🛠️ Template de maintenance créé.');
    }
}

async function main() {
    const startTime = Date.now();
    console.log('🌱 Début du peuplement de la base de données (Seeding)...');

    const dataPath = path.resolve(process.cwd(), 'data/05_final_seed.json');
    console.log(`📂 Lecture du dataset : ${dataPath}`);
    const rawContent = await fs.readFile(dataPath, 'utf-8');
    const dataset: FinalDataset = JSON.parse(rawContent);

    // 1. Seed des catégories + incompatibilités
    const categoryMap = await seedCategories(
        prisma,
        dataset.categories,
        dataset.categoryIncompatibilities,
    );

    // 2. Seed des 35 731 espèces
    await seedSpecies(prisma, dataset.species, categoryMap);

    // 3. Seed des modèles de maintenance par défaut
    await seedMaintenanceTemplates();

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Peuplement terminé avec succès en ${durationSec}s !`);
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });