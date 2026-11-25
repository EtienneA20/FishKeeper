import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EROLE } from '@/constants/enum/role.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';
import type { Prisma } from '@/generated/prisma/client';
import type { ISpeciesDto } from '@/interface/dto/species.dto';
import prisma from '@/lib/db';
import {
    createTestAquarium,
    createTestSpecies,
    createTestUser,
    resetDatabase,
} from '../helpers/factories';

// Only the Next.js request context is faked. Prisma runs against a real SQLite
// database built from prisma/migrations (see tests/setup).
const mocks = vi.hoisted(() => ({ getServerSession: vi.fn() }));
vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }));
vi.mock('@/auth', () => ({ authOptions: {} }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import {
    createSpecies,
    deleteSpecies,
    getSpecies,
    getSpeciesById,
    searchSpeciesOptions,
    updateSpecies,
} from '@/actions/species.controller';

const NOT_AUTHENTICATED = 'Vous devez être connecté pour effectuer cette action.';
const FORBIDDEN = "Vous n'avez pas les droits pour effectuer cette action.";
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

type Account = Prisma.UserModel;
type Category = Prisma.SpeciesCategoryModel;
type Species = Prisma.SpeciesModel;

function signInAs(account: { id: string; role: string } | null): void {
    mocks.getServerSession.mockResolvedValue(
        account ? { user: { id: account.id, role: account.role } } : null
    );
}

function speciesForm(overrides: Partial<ISpeciesDto> = {}): ISpeciesDto {
    return { name: 'Néon bleu', categoryIds: [characins.id], ...overrides };
}

let admin: Account;
let user: Account;
let characins: Category;
let cichlids: Category;
let guppy: Species;

beforeEach(async () => {
    await resetDatabase();
    admin = await createTestUser({ role: EROLE.ADMIN });
    user = await createTestUser({ role: EROLE.USER });
    characins = await prisma.speciesCategory.create({ data: { name: 'Characidés' } });
    cichlids = await prisma.speciesCategory.create({ data: { name: 'Cichlidés' } });
    guppy = await createTestSpecies(characins.id, { name: 'Guppy', scientificName: 'Poecilia reticulata' });
    signInAs(admin);
});

describe('access control', () => {
    const actions = [
        ['getSpecies', () => getSpecies({ page: 0, pageSize: 10 })],
        ['getSpeciesById', () => getSpeciesById(guppy.id)],
        ['searchSpeciesOptions', () => searchSpeciesOptions('')],
        ['createSpecies', () => createSpecies(speciesForm())],
        ['updateSpecies', () => updateSpecies(guppy.id, speciesForm())],
        ['deleteSpecies', () => deleteSpecies(guppy.id)],
    ] as const;

    it.each(actions)('%s requires a signed-in user', async (_name, action) => {
        signInAs(null);
        await expect(action()).rejects.toThrow(NOT_AUTHENTICATED);
    });

    it.each(actions)('%s is forbidden to a USER', async (_name, action) => {
        signInAs(user);
        await expect(action()).rejects.toThrow(FORBIDDEN);
        expect(await prisma.species.count()).toBe(1);
    });
});

describe('getSpecies', () => {
    beforeEach(async () => {
        await createTestSpecies(cichlids.id, { name: 'Scalaire', minTemperature: 24 });
        await createTestSpecies(cichlids.id, { name: 'Discus', minTemperature: 28 });
    });

    it('paginates by name and returns the total count', async () => {
        const first = await getSpecies({ page: 0, pageSize: 2 });
        const second = await getSpecies({ page: 1, pageSize: 2 });

        expect(first.total).toBe(3);
        expect(first.rows.map((s) => s.name)).toEqual(['Discus', 'Guppy']);
        expect(second.rows.map((s) => s.name)).toEqual(['Scalaire']);
    });

    it('sorts on an allowed field and ignores unknown ones', async () => {
        const byTemperature = await getSpecies({
            page: 0,
            pageSize: 10,
            sortField: 'minTemperature',
            sortOrder: 'desc',
        });
        expect(byTemperature.rows.map((s) => s.name)).toEqual(['Discus', 'Scalaire', 'Guppy']);

        const unknown = await getSpecies({
            page: 0,
            pageSize: 10,
            sortField: 'password' as never,
        });
        expect(unknown.rows.map((s) => s.name)).toEqual(['Discus', 'Guppy', 'Scalaire']);
    });

    it('searches on name and scientific name', async () => {
        const result = await getSpecies({ page: 0, pageSize: 10, search: 'poecilia' });
        expect(result.total).toBe(1);
        expect(result.rows[0]).toMatchObject({
            name: 'Guppy',
            categories: [{ id: characins.id, name: 'Characidés' }],
            categoryIds: [characins.id],
            populationCount: 0,
        });
    });

    it('returns null for an unknown id', async () => {
        await expect(getSpeciesById(UNKNOWN_ID)).resolves.toBeNull();
    });

    it('limits the options returned to a selector', async () => {
        const options = await searchSpeciesOptions('us');
        expect(options).toEqual([expect.objectContaining({ name: 'Discus', scientificName: null })]);
    });
});

describe('createSpecies', () => {
    it('creates a trimmed species with all its fields and categories', async () => {
        await createSpecies(
            speciesForm({
                name: '  Néon bleu  ',
                scientificName: '  ',
                categoryIds: [characins.id, cichlids.id, characins.id],
                waterType: EWaterType.FRESH_SOFT,
                minTemperature: 20,
                maxTemperature: 26,
                minPh: 5,
                maxPh: 7,
                minVolume: 54,
                aggressiveness: EAggressiveness.PEACEFUL,
            })
        );

        const created = await prisma.species.findUniqueOrThrow({
            where: { name: 'Néon bleu' },
            include: { categories: { orderBy: { name: 'asc' } } },
        });
        expect(created).toMatchObject({
            scientificName: null,
            waterType: EWaterType.FRESH_SOFT,
            minTemperature: 20,
            maxTemperature: 26,
            minVolume: 54,
            aggressiveness: EAggressiveness.PEACEFUL,
        });
        expect(created.categories.map((c) => c.name)).toEqual(['Characidés', 'Cichlidés']);
    });

    it('refuses a duplicate name', async () => {
        await expect(createSpecies(speciesForm({ name: 'Guppy' }))).rejects.toThrow(
            EERROR_MESSAGE.SPECIES_NAME_TAKEN
        );
    });

    it('refuses a name that is too short', async () => {
        await expect(createSpecies(speciesForm({ name: 'A' }))).rejects.toThrow(
            EERROR_MESSAGE.SPECIES_NAME_TOO_SHORT
        );
    });

    it('requires at least one existing category', async () => {
        await expect(createSpecies(speciesForm({ categoryIds: [] }))).rejects.toThrow(
            EERROR_MESSAGE.SPECIES_CATEGORY_REQUIRED
        );
        await expect(createSpecies(speciesForm({ categoryIds: [UNKNOWN_ID] }))).rejects.toThrow(
            EERROR_MESSAGE.SPECIES_CATEGORY_INVALID
        );
        expect(await prisma.species.count()).toBe(1);
    });

    it('refuses invalid enums, negative numbers and inverted ranges', async () => {
        await expect(
            createSpecies(speciesForm({ waterType: 'LAVA' as EWaterType }))
        ).rejects.toThrow(EERROR_MESSAGE.SPECIES_WATER_TYPE_INVALID);
        await expect(createSpecies(speciesForm({ minPh: -1 }))).rejects.toThrow(
            EERROR_MESSAGE.SPECIES_NUMBER_INVALID
        );
        for (const outOfBounds of [
            { maxPh: 15 },
            { maxTemperature: 1000 },
            { minPh: 7.123 },
            { minVolume: 10.5 },
            { minGh: Number.NaN },
            { minKh: Number.POSITIVE_INFINITY },
            { minGh: '12' as unknown as number },
        ]) {
            await expect(createSpecies(speciesForm(outOfBounds))).rejects.toThrow(
                EERROR_MESSAGE.SPECIES_NUMBER_INVALID
            );
        }
        await expect(createSpecies(speciesForm({ name: 'x'.repeat(121) }))).rejects.toThrow(
            EERROR_MESSAGE.TEXT_TOO_LONG
        );
        await expect(
            createSpecies(speciesForm({ imageURL: 'javascript:alert(1)' }))
        ).rejects.toThrow(EERROR_MESSAGE.IMAGE_URL_INVALID);
        await expect(
            createSpecies(speciesForm({ minTemperature: 30, maxTemperature: 20 }))
        ).rejects.toThrow(EERROR_MESSAGE.SPECIES_RANGE_INVALID);
        expect(await prisma.species.count()).toBe(1);
    });
});

describe('updateSpecies', () => {
    it('replaces the fields and categories, clearing omitted values', async () => {
        await updateSpecies(
            guppy.id,
            speciesForm({ name: 'Guppy', categoryIds: [cichlids.id], minTemperature: 22 })
        );

        const updated = await getSpeciesById(guppy.id);
        expect(updated).toMatchObject({
            scientificName: null,
            minTemperature: 22,
            categoryIds: [cichlids.id],
        });
    });

    it('allows keeping its own name but not taking another one', async () => {
        await createTestSpecies(characins.id, { name: 'Platy' });
        await expect(updateSpecies(guppy.id, speciesForm({ name: 'Guppy' }))).resolves.toBeUndefined();
        await expect(updateSpecies(guppy.id, speciesForm({ name: 'Platy' }))).rejects.toThrow(
            EERROR_MESSAGE.SPECIES_NAME_TAKEN
        );
    });

    it('refuses an unknown species', async () => {
        await expect(updateSpecies(UNKNOWN_ID, speciesForm())).rejects.toThrow(
            EERROR_MESSAGE.SPECIES_NOT_FOUND
        );
    });
});

describe('deleteSpecies', () => {
    it('deletes the species and keeps its categories', async () => {
        await deleteSpecies(guppy.id);

        expect(await prisma.species.findUnique({ where: { id: guppy.id } })).toBeNull();
        expect(await prisma.speciesCategory.count()).toBe(2);
    });

    it('refuses when the species lives in an aquarium', async () => {
        const aquarium = await createTestAquarium(admin.id);
        await prisma.aquariumPopulation.create({
            data: { aquariumId: aquarium.id, speciesId: guppy.id },
        });

        await expect(deleteSpecies(guppy.id)).rejects.toThrow(EERROR_MESSAGE.SPECIES_IN_AQUARIUM);
        expect(await prisma.species.count()).toBe(1);
    });

    it('refuses an unknown species', async () => {
        await expect(deleteSpecies(UNKNOWN_ID)).rejects.toThrow(EERROR_MESSAGE.SPECIES_NOT_FOUND);
    });
});
