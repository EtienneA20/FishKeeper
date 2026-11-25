'use server';

import { revalidatePath } from 'next/cache';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { DATA_ADMIN_ROLES } from '@/constants/enum/role.enum';
import { POPULATION_MIN_DATE } from '@/constants/form-limits';
import { IAquariumPopulationDto } from '@/interface/dto/aquarium-population.dto';
import type {
    IAquariumPopulationDetails,
    IPopulationAquariumOption,
} from '@/interface/entity/aquarium-population.entity';
import { ActionError, runAction, type ActionResult } from '@/lib/action-result';
import { requireRole } from '@/lib/auth-guard';
import prisma from '@/lib/db';
import { assertValidDto, emptyToUndefined } from '@/lib/validate-dto';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const POPULATION_DETAILS_INCLUDE = {
    aquarium: {
        select: { id: true, name: true, owner: { select: { name: true } } },
    },
    species: { select: { id: true, name: true, scientificName: true } },
} as const;

/** Le schéma impose une seule ligne par couple (aquarium, espèce), vérifiée par la base. */
const POPULATION_WRITE_OPTIONS = {
    uniqueViolation: EERROR_MESSAGE.POPULATION_ALREADY_IN_AQUARIUM,
};

interface PopulationRow {
    id: string;
    name: string | null;
    introducedAt: Date;
    notes: string | null;
    size: number | null;
    weight: number | null;
    imageURL: string | null;
    aquariumId: string;
    speciesId: string;
    aquarium: { id: string; name: string; owner: { name: string } };
    species: { id: string; name: string; scientificName: string | null };
}

interface PopulationData {
    name: string | null;
    /** `undefined` : date par défaut à la création, inchangée à la modification. */
    introducedAt: Date | undefined;
    notes: string | null;
    size: number | null;
    weight: number | null;
    imageURL: string | null;
    aquariumId: string;
    speciesId: string;
}

function revalidatePopulationPages(): void {
    revalidatePath('/data/individu');
    revalidatePath('/data/espece');
    revalidatePath('/data');
}

function toPopulationDetails({
    aquarium,
    ...row
}: PopulationRow): IAquariumPopulationDetails {
    return {
        ...row,
        aquarium: {
            id: aquarium.id,
            name: aquarium.name,
            ownerName: aquarium.owner.name,
        },
    };
}

async function validatePopulationDto(
    populationDto: IAquariumPopulationDto
): Promise<PopulationData> {
    const dto = Object.assign(new IAquariumPopulationDto(), populationDto);
    dto.name = emptyToUndefined(dto.name);
    dto.notes = emptyToUndefined(dto.notes);
    dto.imageURL = emptyToUndefined(dto.imageURL);
    dto.introducedAt = emptyToUndefined(dto.introducedAt);

    await assertValidDto(dto, EERROR_MESSAGE.POPULATION_VALIDATION);

    const introducedAt = dto.introducedAt
        ? new Date(dto.introducedAt)
        : undefined;
    // Un jour de marge : le client envoie la date du jour dans son propre fuseau.
    const latest = Date.now() + ONE_DAY_MS;
    if (
        introducedAt &&
        (introducedAt.getTime() < new Date(POPULATION_MIN_DATE).getTime() ||
            introducedAt.getTime() > latest)
    ) {
        throw new ActionError(EERROR_MESSAGE.POPULATION_DATE_OUT_OF_RANGE);
    }

    const [aquarium, species] = await Promise.all([
        prisma.aquarium.findUnique({
            where: { id: dto.aquariumId },
            select: { id: true },
        }),
        prisma.species.findUnique({
            where: { id: dto.speciesId },
            select: { id: true },
        }),
    ]);
    if (!aquarium)
        throw new ActionError(EERROR_MESSAGE.POPULATION_AQUARIUM_INVALID);
    if (!species) throw new ActionError(EERROR_MESSAGE.SPECIES_NOT_FOUND);

    return {
        name: dto.name ?? null,
        introducedAt,
        notes: dto.notes ?? null,
        size: dto.size ?? null,
        weight: dto.weight ?? null,
        imageURL: dto.imageURL ?? null,
        aquariumId: dto.aquariumId,
        speciesId: dto.speciesId,
    };
}

async function assertPopulationExists(id: string): Promise<void> {
    const population = await prisma.aquariumPopulation.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!population) {
        throw new ActionError(EERROR_MESSAGE.POPULATION_NOT_FOUND);
    }
}

export async function getPopulations(): Promise<IAquariumPopulationDetails[]> {
    await requireRole(...DATA_ADMIN_ROLES);
    const populations = await prisma.aquariumPopulation.findMany({
        include: POPULATION_DETAILS_INCLUDE,
        orderBy: [{ aquarium: { name: 'asc' } }, { species: { name: 'asc' } }],
    });

    return populations.map(toPopulationDetails);
}

export async function getPopulationById(
    id: string
): Promise<IAquariumPopulationDetails | null> {
    await requireRole(...DATA_ADMIN_ROLES);
    const population = await prisma.aquariumPopulation.findUnique({
        where: { id },
        include: POPULATION_DETAILS_INCLUDE,
    });

    return population ? toPopulationDetails(population) : null;
}

/** Tous les aquariums, avec le nom de leur propriétaire, pour le formulaire. */
export async function getPopulationAquariumOptions(): Promise<
    IPopulationAquariumOption[]
> {
    await requireRole(...DATA_ADMIN_ROLES);
    const aquariums = await prisma.aquarium.findMany({
        select: { id: true, name: true, owner: { select: { name: true } } },
        orderBy: [{ name: 'asc' }, { owner: { name: 'asc' } }],
    });

    return aquariums.map(({ id, name, owner }) => ({
        id,
        name,
        ownerName: owner.name,
    }));
}

export async function createPopulation(
    populationDto: IAquariumPopulationDto
): Promise<ActionResult> {
    await requireRole(...DATA_ADMIN_ROLES);
    return runAction(async () => {
        const data = await validatePopulationDto(populationDto);

        await prisma.aquariumPopulation.create({ data });

        revalidatePopulationPages();
    }, POPULATION_WRITE_OPTIONS);
}

export async function updatePopulation(
    id: string,
    populationDto: IAquariumPopulationDto
): Promise<ActionResult> {
    await requireRole(...DATA_ADMIN_ROLES);
    return runAction(async () => {
        await assertPopulationExists(id);
        const data = await validatePopulationDto(populationDto);

        await prisma.aquariumPopulation.update({ where: { id }, data });

        revalidatePopulationPages();
    }, POPULATION_WRITE_OPTIONS);
}

export async function deletePopulation(id: string): Promise<ActionResult> {
    await requireRole(...DATA_ADMIN_ROLES);
    return runAction(async () => {
        await assertPopulationExists(id);

        await prisma.aquariumPopulation.delete({ where: { id } });

        revalidatePopulationPages();
    });
}
