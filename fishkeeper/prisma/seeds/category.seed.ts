import type { PrismaClient } from '../../generated/prisma/client';

export interface RawCategory {
  name: string;
  description: string | null;
}

export interface RawIncompatibility {
  categoryName: string;
  incompatibleWith: string[];
}

export async function seedCategories(
  prisma: PrismaClient,
  categories: RawCategory[],
  incompatibilities: RawIncompatibility[],
): Promise <Map<string, string>> {
  console.log(`📦 Vérification et importation de ${categories.length} catégories...`);

  // 1. Récupération des catégories déjà présentes pour éviter les doublons sous SQLite
  const existingCategories = await prisma.speciesCategory.findMany({
    select: { id: true, name: true },
  });
  const existingNames = new Set(existingCategories.map((c) => c.name));

  const toInsert = categories
    .filter((cat) => !existingNames.has(cat.name))
    .map((cat) => ({
      name: cat.name,
      description: cat.description,
    }));

  if(toInsert.length > 0) {
  await prisma.speciesCategory.createMany({
    data: toInsert,
  });
  console.log(`   → ${toInsert.length} nouvelles catégories insérées.`);
} else {
  console.log('   → Toutes les catégories existent déjà.');
}

// 2. Construction du dictionnaire complet name -> id
const allCategories = await prisma.speciesCategory.findMany({
  select: { id: true, name: true },
});

const categoryMap = new Map<string, string>();
for (const cat of allCategories) {
  categoryMap.set(cat.name, cat.id);
}

// 3. Connexion des relations d'incompatibilité (incompatibleWith)
if (incompatibilities.length > 0) {
  console.log(`🔗 Liaison de ${incompatibilities.length} règles d'incompatibilité...`);
  for (const rule of incompatibilities) {
    const sourceId = categoryMap.get(rule.categoryName);
    if (!sourceId) continue;

    const targetIds = rule.incompatibleWith
      .map((targetName) => categoryMap.get(targetName))
      .filter((id): id is string => Boolean(id));

    if (targetIds.length > 0) {
      await prisma.speciesCategory.update({
        where: { id: sourceId },
        data: {
          incompatibleWith: {
            set: targetIds.map((id) => ({ id })),
          },
        },
      });
    }
  }
}

console.log(`✅ ${categoryMap.size} catégories prêtes.`);
return categoryMap;
}