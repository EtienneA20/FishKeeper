'use server';

import { validate } from 'class-validator';
import { revalidatePath } from 'next/cache';

import { EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { DATA_ADMIN_ROLES } from '@/constants/enum/role.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';
import { ISpeciesDto } from '@/interface/dto/species.dto';
import {
    SPECIES_SORT_FIELDS,
    type ISpeciesDetails,
    type ISpeciesOption,
    type ISpeciesPage,
    type ISpeciesQuery,
} from '@/interface/entity/species.entity';
import { requireRole } from '@/lib/auth-guard';
import prisma from '@/lib/db';

const MAX_PAGE_SIZE = 100;
const OPTIONS_LIMIT = 20;

const SPECIES_DETAILS_INCLUDE = {
    categories: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
    _count: { select: { aquariumLinks: true } },
} as const;

/** Paires min/max dont le minimum ne doit pas dépasser le maximum. */
const RANGES = [
    ['minTemperature', 'maxTemperature'],
    ['minPh', 'maxPh'],
    ['minGh', 'maxGh'],
    ['minKh', 'maxKh'],
] as const;

interface SpeciesRow {
    id: string;
    name: string;
    scientificName: string | null;
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
    categories: { id: string; name: string }[];
    _count: { aquariumLinks: number };
}

/** Données écrites en base : les champs vides deviennent `null` (et effacent l'ancienne valeur). */
interface SpeciesData {
    name: string;
    scientificName: string | null;
    categoryIds: string[];
    description: string | null;
    imageURL: string | null;
    waterType: EWaterType | null;
    minTemperature: number | null;
    maxTemperature: number | null;
    minPh: number | null;
    maxPh: number | null;
    minGh: number | null;
    maxGh: number | null;
    minKh: number | null;
    maxKh: number | null;
    minVolume: number | null;
    aggressiveness: EAggressiveness | null;
}

function revalidateSpeciesPages(): void {
    revalidatePath('/data/espece');
    revalidatePath('/data/categorie');
    revalidatePath('/data/individu');
    revalidatePath('/data');
}

function toSpeciesDetails({ _count, ...row }: SpeciesRow): ISpeciesDetails {
    return {
        ...row,
        waterType: row.waterType as EWaterType | null,
        aggressiveness: row.aggressiveness as EAggressiveness | null,
        categoryIds: row.categories.map((category) => category.id),
        populationCount: _count.aquariumLinks,
    };
}

function emptyToUndefined(value: string | undefined): string | undefined {
    return value?.trim() || undefined;
}

async function validateSpeciesDto(speciesDto: ISpeciesDto): Promise<SpeciesData> {
    const dto = Object.assign(new ISpeciesDto(), speciesDto);
    dto.name = dto.name?.trim();
    dto.scientificName = emptyToUndefined(dto.scientificName);
    dto.description = emptyToUndefined(dto.description);
    dto.imageURL = emptyToUndefined(dto.imageURL);

    const errors = await validate(dto, { whitelist: true });
    if (errors.length > 0) {
        const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
        throw new Error([...new Set(messages)].join(' ') || EERROR_MESSAGE.SPECIES_VALIDATION);
    }

    for (const [min, max] of RANGES) {
        const minValue = dto[min];
        const maxValue = dto[max];
        if (minValue != null && maxValue != null && minValue > maxValue) {
            throw new Error(EERROR_MESSAGE.SPECIES_RANGE_INVALID);
        }
    }

    const categoryIds = [...new Set(dto.categoryIds)];
    const found = await prisma.speciesCategory.count({ where: { id: { in: categoryIds } } });
    if (found !== categoryIds.length) {
        throw new Error(EERROR_MESSAGE.SPECIES_CATEGORY_INVALID);
    }

    return {
        name: dto.name,
        scientificName: dto.scientificName ?? null,
        categoryIds,
        description: dto.description ?? null,
        imageURL: dto.imageURL ?? null,
        waterType: dto.waterType ?? null,
        minTemperature: dto.minTemperature ?? null,
        maxTemperature: dto.maxTemperature ?? null,
        minPh: dto.minPh ?? null,
        maxPh: dto.maxPh ?? null,
        minGh: dto.minGh ?? null,
        maxGh: dto.maxGh ?? null,
        minKh: dto.minKh ?? null,
        maxKh: dto.maxKh ?? null,
        minVolume: dto.minVolume ?? null,
        aggressiveness: dto.aggressiveness ?? null,
    };
}

async function assertNameAvailable(name: string, excludeId?: string): Promise<void> {
    const existing = await prisma.species.findUnique({
        where: { name },
        select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
        throw new Error(EERROR_MESSAGE.SPECIES_NAME_TAKEN);
    }
}

async function assertSpeciesExists(id: string): Promise<void> {
    const species = await prisma.species.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!species) {
        throw new Error(EERROR_MESSAGE.SPECIES_NOT_FOUND);
    }
}

function searchWhere(search?: string) {
    const term = search?.trim();
    if (!term) return {};
    return {
        OR: [{ name: { contains: term } }, { scientificName: { contains: term } }],
    };
}

/**
 * Liste paginée côté serveur : la base contient plusieurs dizaines de milliers d'espèces.
 */
export async function getSpecies(query: ISpeciesQuery): Promise<ISpeciesPage> {
    await requireRole(...DATA_ADMIN_ROLES);

    const pageSize = Math.min(Math.max(Math.trunc(query.pageSize) || 10, 1), MAX_PAGE_SIZE);
    const page = Math.max(Math.trunc(query.page) || 0, 0);
    const sortField =
        query.sortField && SPECIES_SORT_FIELDS.includes(query.sortField) ? query.sortField : 'name';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
    const where = searchWhere(query.search);

    const [rows, total] = await prisma.$transaction([
        prisma.species.findMany({
            where,
            include: SPECIES_DETAILS_INCLUDE,
            // Tri secondaire par nom pour un ordre stable entre les pages.
            orderBy: sortField === 'name' ? { name: sortOrder } : [{ [sortField]: sortOrder }, { name: 'asc' }],
            skip: page * pageSize,
            take: pageSize,
        }),
        prisma.species.count({ where }),
    ]);

    return { rows: rows.map(toSpeciesDetails), total };
}

export async function getSpeciesById(id: string): Promise<ISpeciesDetails | null> {
    await requireRole(...DATA_ADMIN_ROLES);
    const species = await prisma.species.findUnique({
        where: { id },
        include: SPECIES_DETAILS_INCLUDE,
    });

    return species ? toSpeciesDetails(species) : null;
}

/** Recherche d'espèces pour les sélecteurs (limitée à quelques résultats). */
export async function searchSpeciesOptions(search: string): Promise<ISpeciesOption[]> {
    await requireRole(...DATA_ADMIN_ROLES);
    return prisma.species.findMany({
        where: searchWhere(search),
        select: { id: true, name: true, scientificName: true },
        orderBy: { name: 'asc' },
        take: OPTIONS_LIMIT,
    });
}

export async function createSpecies(speciesDto: ISpeciesDto): Promise<void> {
    await requireRole(...DATA_ADMIN_ROLES);
    const { categoryIds, ...data } = await validateSpeciesDto(speciesDto);
    await assertNameAvailable(data.name);

    await prisma.species.create({
        data: {
            ...data,
            categories: { connect: categoryIds.map((id) => ({ id })) },
        },
    });

    revalidateSpeciesPages();
}

export async function updateSpecies(id: string, speciesDto: ISpeciesDto): Promise<void> {
    await requireRole(...DATA_ADMIN_ROLES);
    await assertSpeciesExists(id);
    const { categoryIds, ...data } = await validateSpeciesDto(speciesDto);
    await assertNameAvailable(data.name, id);

    await prisma.species.update({
        where: { id },
        data: {
            ...data,
            categories: { set: categoryIds.map((categoryId) => ({ id: categoryId })) },
        },
    });

    revalidateSpeciesPages();
}

/** Refusé si l'espèce vit encore dans un aquarium (relation `onDelete: Restrict`). */
export async function deleteSpecies(id: string): Promise<void> {
    await requireRole(...DATA_ADMIN_ROLES);
    await assertSpeciesExists(id);

    const populations = await prisma.aquariumPopulation.count({ where: { speciesId: id } });
    if (populations > 0) {
        throw new Error(EERROR_MESSAGE.SPECIES_IN_AQUARIUM);
    }

    // Les lignes de la table de jointure espèce ↔ catégorie partent en cascade.
    await prisma.species.delete({ where: { id } });

    revalidateSpeciesPages();
}
