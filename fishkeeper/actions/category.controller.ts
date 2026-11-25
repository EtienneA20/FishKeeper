'use server';

import { validate } from 'class-validator';
import { revalidatePath } from 'next/cache';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { DATA_ADMIN_ROLES } from '@/constants/enum/role.enum';
import { ISpeciesCategoryDto } from '@/interface/dto/species-category.dto';
import type { ISpeciesCategoryDetails } from '@/interface/entity/species-category.entity';
import { requireRole } from '@/lib/auth-guard';
import prisma from '@/lib/db';

const CATEGORY_LINK_SELECT = { id: true, name: true } as const;

const CATEGORY_DETAILS_SELECT = {
    id: true,
    name: true,
    description: true,
    incompatibleWith: { select: CATEGORY_LINK_SELECT },
    incompatibleFrom: { select: CATEGORY_LINK_SELECT },
    // Nombre de catégories de chaque espèce : 1 = l'espèce n'appartient qu'à celle-ci.
    species: { select: { _count: { select: { categories: true } } } },
} as const;

type CategoryLink = { id: string; name: string };

interface CategoryRow {
    id: string;
    name: string;
    description: string | null;
    incompatibleWith: CategoryLink[];
    incompatibleFrom: CategoryLink[];
    species: { _count: { categories: number } }[];
}

function revalidateCategoryPages(): void {
    revalidatePath('/data/categorie');
    revalidatePath('/data/espece');
    revalidatePath('/data');
}

/** L'incompatibilité est symétrique : on fusionne les deux côtés de la relation. */
function toCategoryDetails(row: CategoryRow): ISpeciesCategoryDetails {
    const incompatible = new Map<string, CategoryLink>();
    for (const link of [...row.incompatibleWith, ...row.incompatibleFrom]) {
        incompatible.set(link.id, link);
    }

    return {
        id: row.id,
        name: row.name,
        description: row.description,
        incompatibleCategories: [...incompatible.values()].sort((a, b) =>
            a.name.localeCompare(b.name),
        ),
        speciesCount: row.species.length,
        exclusiveSpeciesCount: row.species.filter((s) => s._count.categories === 1).length,
    };
}

async function validateCategoryDto(
    categoryDto: ISpeciesCategoryDto,
    excludeId?: string,
): Promise<Required<ISpeciesCategoryDto>> {
    const dto = Object.assign(new ISpeciesCategoryDto(), categoryDto);
    dto.name = dto.name?.trim();
    dto.description = dto.description?.trim() || undefined;
    dto.incompatibleWithIds = dto.incompatibleWithIds ?? [];

    const errors = await validate(dto, { whitelist: true });
    if (errors.length > 0) {
        const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
        throw new Error(messages.join(' ') || EERROR_MESSAGE.CATEGORY_VALIDATION);
    }

    // Une catégorie ne peut pas être incompatible avec elle-même.
    const ids = [...new Set(dto.incompatibleWithIds)].filter((id) => id !== excludeId);
    if (ids.length > 0) {
        const found = await prisma.speciesCategory.count({ where: { id: { in: ids } } });
        if (found !== ids.length) {
            throw new Error(EERROR_MESSAGE.CATEGORY_INCOMPATIBLE_INVALID);
        }
    }

    return { name: dto.name, description: dto.description ?? '', incompatibleWithIds: ids };
}

async function assertNameAvailable(name: string, excludeId?: string): Promise<void> {
    const existing = await prisma.speciesCategory.findUnique({
        where: { name },
        select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
        throw new Error(EERROR_MESSAGE.CATEGORY_NAME_TAKEN);
    }
}

async function assertCategoryExists(id: string): Promise<void> {
    const category = await prisma.speciesCategory.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!category) {
        throw new Error(EERROR_MESSAGE.CATEGORY_NOT_FOUND);
    }
}

export async function getCategories(): Promise<ISpeciesCategoryDetails[]> {
    await requireRole(...DATA_ADMIN_ROLES);
    const categories = await prisma.speciesCategory.findMany({
        select: CATEGORY_DETAILS_SELECT,
        orderBy: { name: 'asc' },
    });

    return categories.map(toCategoryDetails);
}

/** Liste légère (id + nom) pour les sélecteurs, sans le comptage des espèces. */
export async function getCategoryOptions(): Promise<CategoryLink[]> {
    await requireRole(...DATA_ADMIN_ROLES);
    return prisma.speciesCategory.findMany({
        select: CATEGORY_LINK_SELECT,
        orderBy: { name: 'asc' },
    });
}

export async function getCategoryById(id: string): Promise<ISpeciesCategoryDetails | null> {
    await requireRole(...DATA_ADMIN_ROLES);
    const category = await prisma.speciesCategory.findUnique({
        where: { id },
        select: CATEGORY_DETAILS_SELECT,
    });

    return category ? toCategoryDetails(category) : null;
}

export async function createCategory(categoryDto: ISpeciesCategoryDto): Promise<void> {
    await requireRole(...DATA_ADMIN_ROLES);
    const { name, description, incompatibleWithIds } = await validateCategoryDto(categoryDto);
    await assertNameAvailable(name);

    // Les liens sont écrits des deux côtés pour que la relation reste symétrique.
    const links = incompatibleWithIds.map((id) => ({ id }));
    await prisma.speciesCategory.create({
        data: {
            name,
            description: description || null,
            incompatibleWith: { connect: links },
            incompatibleFrom: { connect: links },
        },
    });

    revalidateCategoryPages();
}

export async function updateCategory(id: string, categoryDto: ISpeciesCategoryDto): Promise<void> {
    await requireRole(...DATA_ADMIN_ROLES);
    await assertCategoryExists(id);
    const { name, description, incompatibleWithIds } = await validateCategoryDto(categoryDto, id);
    await assertNameAvailable(name, id);

    // `set` remplace les deux côtés : retirer B des incompatibilités de A retire aussi A de celles de B.
    const links = incompatibleWithIds.map((linkId) => ({ id: linkId }));
    await prisma.speciesCategory.update({
        where: { id },
        data: {
            name,
            description: description || null,
            incompatibleWith: { set: links },
            incompatibleFrom: { set: links },
        },
    });

    revalidateCategoryPages();
}

/** Espèces qui n'appartiennent qu'à cette catégorie : elles disparaissent avec elle. */
function onlyInCategory(id: string) {
    return {
        categories: { some: { id } },
        NOT: { categories: { some: { id: { not: id } } } },
    };
}

/**
 * Supprime la catégorie. Les espèces qui n'appartiennent qu'à elle sont supprimées ;
 * les espèces rattachées à d'autres catégories perdent seulement ce lien.
 * Refusé si une espèce à supprimer vit encore dans un aquarium.
 */
export async function deleteCategory(id: string): Promise<void> {
    await requireRole(...DATA_ADMIN_ROLES);
    await assertCategoryExists(id);

    const populations = await prisma.aquariumPopulation.count({
        where: { species: onlyInCategory(id) },
    });
    if (populations > 0) {
        throw new Error(EERROR_MESSAGE.CATEGORY_SPECIES_IN_AQUARIUM);
    }

    // Les lignes de la table de jointure (espèces, incompatibilités) partent en cascade.
    await prisma.$transaction([
        prisma.species.deleteMany({ where: onlyInCategory(id) }),
        prisma.speciesCategory.delete({ where: { id } }),
    ]);

    revalidateCategoryPages();
}
