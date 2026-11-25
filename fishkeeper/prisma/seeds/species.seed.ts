import type { PrismaClient } from '../../generated/prisma/client';

export interface RawSpecies {
    name: string;
    scientificName: string | null;
    /** Une espèce peut appartenir à plusieurs catégories (relation many-to-many). */
    categoryNames: string[];
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
const LINK_BATCH_SIZE = 500;

function resolveCategoryIds(sp: RawSpecies, categoryMap: Map<string, string>): string[] {
    if (sp.categoryNames.length === 0) {
        throw new Error(`Aucune catégorie pour l'espèce "${sp.name}"`);
    }

    return sp.categoryNames.map((categoryName) => {
        const categoryId = categoryMap.get(categoryName);
        if (!categoryId) {
            throw new Error(`Catégorie introuvable pour l'espèce "${sp.name}" : "${categoryName}"`);
        }
        return categoryId;
    });
}

/**
 * `createMany` ne sait pas créer de liens many-to-many : les espèces sont insérées seules,
 * puis rattachées à leurs catégories, une mise à jour par catégorie (et non par espèce).
 */
async function linkSpeciesToCategories(
    prisma: PrismaClient,
    categoryIdsBySpeciesName: Map<string, string[]>,
): Promise<void> {
    const insertedSpecies = await prisma.species.findMany({ select: { id: true, name: true } });

    const speciesIdsByCategory = new Map<string, string[]>();
    for (const { id, name } of insertedSpecies) {
        for (const categoryId of categoryIdsBySpeciesName.get(name) ?? []) {
            const speciesIds = speciesIdsByCategory.get(categoryId) ?? [];
            speciesIds.push(id);
            speciesIdsByCategory.set(categoryId, speciesIds);
        }
    }

    console.log(`🔗 Liaison des espèces à ${speciesIdsByCategory.size} catégories...`);
    for (const [categoryId, speciesIds] of speciesIdsByCategory) {
        for (let i = 0; i < speciesIds.length; i += LINK_BATCH_SIZE) {
            await prisma.speciesCategory.update({
                where: { id: categoryId },
                data: {
                    species: {
                        connect: speciesIds.slice(i, i + LINK_BATCH_SIZE).map((id) => ({ id })),
                    },
                },
            });
        }
    }
}

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

    // Catégories des espèces à insérer, résolues avant toute écriture pour échouer tôt.
    const categoryIdsBySpeciesName = new Map<string, string[]>();

    const toInsert = speciesList
        .filter((sp) => !existingNames.has(sp.name))
        .map((sp) => {
            categoryIdsBySpeciesName.set(sp.name, resolveCategoryIds(sp, categoryMap));

            return {
                name: sp.name,
                scientificName: sp.scientificName,
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

    await linkSpeciesToCategories(prisma, categoryIdsBySpeciesName);

    console.log('✅ Importation des espèces terminée.');
}