import type { PrismaClient } from '../../generated/prisma/client';

export interface RawSpecies {
    name: string;
    scientificName: string | null;
    categoryName: string;
    description: string | null;
    imageURL: string | null;
    waterType: string | null;
    minTemperature: number | null;
    maxTemperature: number | null;
    minPh: number | null;
    maxPh: number | null;
    minGh: number | null;
    maxGh: number | null;
    minKh: number | null;
    maxKh: number | null;
    minVolume: number | null;
    aggressiveness: string | null;
}

const BATCH_SIZE = 200;

export async function seedSpecies(
    prisma: PrismaClient,
    speciesList: RawSpecies[],
    categoryMap: Map<string, string>,
): Promise<void> {
    console.log(`🐟 Vérification des espèces existantes en base...`);

    const existingSpecies = await prisma.species.findMany({
        select: { name: true },
    });
    const existingNames = new Set(existingSpecies.map((s) => s.name));

    const toInsert = speciesList
        .filter((sp) => !existingNames.has(sp.name))
        .map((sp) => {
            const categoryId = categoryMap.get(sp.categoryName);
            if (!categoryId) {
                throw new Error(`Catégorie introuvable pour l'espèce "${sp.name}" : "${sp.categoryName}"`);
            }

            return {
                name: sp.name,
                scientificName: sp.scientificName,
                categoryId,
                description: sp.description,
                imageURL: sp.imageURL,
                waterType: sp.waterType,
                minTemperature: sp.minTemperature,
                maxTemperature: sp.maxTemperature,
                minPh: sp.minPh,
                maxPh: sp.maxPh,
                minGh: sp.minGh,
                maxGh: sp.maxGh,
                minKh: sp.minKh,
                maxKh: sp.maxKh,
                minVolume: sp.minVolume,
                aggressiveness: sp.aggressiveness,
            };
        });

    if (toInsert.length === 0) {
        console.log('✅ Toutes les espèces sont déjà présentes en base.');
        return;
    }

    console.log(`🚀 Insertion de ${toInsert.length} nouvelles espèces par lots de ${BATCH_SIZE}...`);
    const totalBatches = Math.ceil(toInsert.length / BATCH_SIZE);

    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const chunk = toInsert.slice(i, i + BATCH_SIZE);
        await prisma.species.createMany({
            data: chunk,
        });

        const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
        if (currentBatch % 25 === 0 || currentBatch === totalBatches) {
            const processed = Math.min(i + BATCH_SIZE, toInsert.length);
            console.log(`   → Progression : ${processed} / ${toInsert.length} espèces (${currentBatch}/${totalBatches} lots)`);
        }
    }

    console.log('✅ Importation des espèces terminée.');
}