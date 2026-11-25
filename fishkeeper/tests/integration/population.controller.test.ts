import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EROLE } from '@/constants/enum/role.enum';
import type { Prisma } from '@/generated/prisma/client';
import type { IAquariumPopulationDto } from '@/interface/dto/aquarium-population.dto';
import prisma from '@/lib/db';
import {
    createTestAquarium,
    createTestCategory,
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
    createPopulation,
    deletePopulation,
    getPopulationAquariumOptions,
    getPopulationById,
    getPopulations,
    updatePopulation,
} from '@/actions/population.controller';

const NOT_AUTHENTICATED =
    'Vous devez être connecté pour effectuer cette action.';
const FORBIDDEN = "Vous n'avez pas les droits pour effectuer cette action.";
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

/** Résultat d'Ne mutation refusée (le message peut regrouper plusieurs erreurs). */
const failure = (message: string) => ({
    ok: false,
    error: expect.stringContaining(message),
});

type Account = Prisma.UserModel;
type Aquarium = Prisma.AquariumModel;
type Species = Prisma.SpeciesModel;
type Population = Prisma.AquariumPopulationModel;

function signInAs(account: { id: string; role: string } | null): void {
    mocks.getServerSession.mockResolvedValue(
        account ? { user: { id: account.id, role: account.role } } : null
    );
}

function populationForm(
    overrides: Partial<IAquariumPopulationDto> = {}
): IAquariumPopulationDto {
    return { aquariumId: aquarium.id, speciesId: neon.id, ...overrides };
}

let admin: Account;
let user: Account;
let aquarium: Aquarium;
let neon: Species;
let guppy: Species;
let existing: Population;

beforeEach(async () => {
    await resetDatabase();
    admin = await createTestUser({ role: EROLE.ADMIN });
    user = await createTestUser({ role: EROLE.USER, name: 'Alice' });
    const category = await createTestCategory();
    neon = await createTestSpecies(category.id, { name: 'Néon' });
    guppy = await createTestSpecies(category.id, { name: 'Guppy' });
    aquarium = await createTestAquarium(user.id, { name: 'Bac salon' });
    existing = await prisma.aquariumPopulation.create({
        data: { aquariumId: aquarium.id, speciesId: guppy.id, name: 'Bubulle' },
    });
    signInAs(admin);
});

describe('access control', () => {
    const actions = [
        ['getPopulations', () => getPopulations()],
        ['getPopulationById', () => getPopulationById(existing.id)],
        ['getPopulationAquariumOptions', () => getPopulationAquariumOptions()],
        ['createPopulation', () => createPopulation(populationForm())],
        [
            'updatePopulation',
            () => updatePopulation(existing.id, populationForm()),
        ],
        ['deletePopulation', () => deletePopulation(existing.id)],
    ] as const;

    it.each(actions)('%s requires a signed-in user', async (_name, action) => {
        signInAs(null);
        await expect(action()).rejects.toThrow(NOT_AUTHENTICATED);
    });

    it.each(actions)('%s is forbidden to a USER', async (_name, action) => {
        signInAs(user);
        await expect(action()).rejects.toThrow(FORBIDDEN);
        expect(await prisma.aquariumPopulation.count()).toBe(1);
    });
});

describe('getPopulations', () => {
    it('lists populations with their aquarium, owner and species', async () => {
        const populations = await getPopulations();

        expect(populations).toHaveLength(1);
        expect(populations[0]).toMatchObject({
            name: 'Bubulle',
            aquarium: {
                id: aquarium.id,
                name: 'Bac salon',
                ownerName: 'Alice',
            },
            species: { id: guppy.id, name: 'Guppy' },
        });
    });

    it('lists every aquarium with its owner for the form', async () => {
        await expect(getPopulationAquariumOptions()).resolves.toEqual([
            { id: aquarium.id, name: 'Bac salon', ownerName: 'Alice' },
        ]);
    });

    it('returns null for an unknown id', async () => {
        await expect(getPopulationById(UNKNOWN_ID)).resolves.toBeNull();
    });
});

describe('createPopulation', () => {
    it('creates a trimmed population with its fields', async () => {
        const result = await createPopulation(
            populationForm({
                name: '  Nemo  ',
                notes: ' ',
                introducedAt: '2026-01-15',
                size: 3.5,
                weight: 1,
            })
        );
        expect(result).toEqual({ ok: true });

        const created = await prisma.aquariumPopulation.findUniqueOrThrow({
            where: {
                aquariumId_speciesId: {
                    aquariumId: aquarium.id,
                    speciesId: neon.id,
                },
            },
        });
        expect(created).toMatchObject({
            name: 'Nemo',
            notes: null,
            size: 3.5,
            weight: 1,
        });
        expect(created.introducedAt.toISOString()).toBe(
            '2026-01-15T00:00:00.000Z'
        );
    });

    it('defaults the introduction date to now', async () => {
        const before = Date.now();
        expect(await createPopulation(populationForm())).toEqual({ ok: true });

        const created = await prisma.aquariumPopulation.findFirstOrThrow({
            where: { speciesId: neon.id },
        });
        expect(created.introducedAt.getTime()).toBeGreaterThanOrEqual(
            before - 1000
        );
    });

    it('refuses a species already in the aquarium', async () => {
        await expect(
            createPopulation(populationForm({ speciesId: guppy.id }))
        ).resolves.toEqual(
            failure(EERROR_MESSAGE.POPULATION_ALREADY_IN_AQUARIUM)
        );
    });

    it('refuses an unknown aquarium or species', async () => {
        await expect(
            createPopulation(populationForm({ aquariumId: UNKNOWN_ID }))
        ).resolves.toEqual(failure(EERROR_MESSAGE.POPULATION_AQUARIUM_INVALID));
        await expect(
            createPopulation(populationForm({ speciesId: UNKNOWN_ID }))
        ).resolves.toEqual(failure(EERROR_MESSAGE.SPECIES_NOT_FOUND));
        expect(await prisma.aquariumPopulation.count()).toBe(1);
    });

    it('refuses missing ids, invalid dates and negative numbers', async () => {
        await expect(
            createPopulation(populationForm({ aquariumId: '' }))
        ).resolves.toEqual(
            failure(EERROR_MESSAGE.POPULATION_AQUARIUM_REQUIRED)
        );
        await expect(
            createPopulation(populationForm({ introducedAt: 'hier' }))
        ).resolves.toEqual(failure(EERROR_MESSAGE.POPULATION_DATE_INVALID));
        await expect(
            createPopulation(populationForm({ size: -2 }))
        ).resolves.toEqual(failure(EERROR_MESSAGE.POPULATION_NUMBER_INVALID));
        await expect(
            createPopulation(populationForm({ weight: 100_001 }))
        ).resolves.toEqual(failure(EERROR_MESSAGE.POPULATION_NUMBER_INVALID));
        await expect(
            createPopulation(populationForm({ size: Number.NaN }))
        ).resolves.toEqual(failure(EERROR_MESSAGE.POPULATION_NUMBER_INVALID));
        await expect(
            createPopulation(populationForm({ notes: 'x'.repeat(2001) }))
        ).resolves.toEqual(failure(EERROR_MESSAGE.TEXT_TOO_LONG));
        expect(await prisma.aquariumPopulation.count()).toBe(1);
    });

    it('refuses an introduction date in the future or before 1900', async () => {
        await expect(
            createPopulation(populationForm({ introducedAt: '3000-01-01' }))
        ).resolves.toEqual(
            failure(EERROR_MESSAGE.POPULATION_DATE_OUT_OF_RANGE)
        );
        await expect(
            createPopulation(populationForm({ introducedAt: '1850-06-01' }))
        ).resolves.toEqual(
            failure(EERROR_MESSAGE.POPULATION_DATE_OUT_OF_RANGE)
        );
    });
});

describe('updatePopulation', () => {
    it('updates the fields and keeps the date when none is given', async () => {
        expect(
            await updatePopulation(
                existing.id,
                populationForm({ speciesId: guppy.id, weight: 2 })
            )
        ).toEqual({ ok: true });

        const updated = await prisma.aquariumPopulation.findUniqueOrThrow({
            where: { id: existing.id },
        });
        expect(updated).toMatchObject({ name: null, weight: 2 });
        expect(updated.introducedAt).toEqual(existing.introducedAt);
    });

    it('can move to another species when the pair is free', async () => {
        expect(
            await updatePopulation(
                existing.id,
                populationForm({ speciesId: neon.id })
            )
        ).toEqual({ ok: true });
        expect((await getPopulationById(existing.id))?.species.name).toBe(
            'Néon'
        );
    });

    it('refuses a pair already used by another population', async () => {
        const other = await prisma.aquariumPopulation.create({
            data: { aquariumId: aquarium.id, speciesId: neon.id },
        });
        await expect(
            updatePopulation(other.id, populationForm({ speciesId: guppy.id }))
        ).resolves.toEqual(
            failure(EERROR_MESSAGE.POPULATION_ALREADY_IN_AQUARIUM)
        );
    });

    it('refuses an unknown population', async () => {
        await expect(
            updatePopulation(UNKNOWN_ID, populationForm())
        ).resolves.toEqual(failure(EERROR_MESSAGE.POPULATION_NOT_FOUND));
    });
});

describe('deletePopulation', () => {
    it('deletes the population and keeps the species and aquarium', async () => {
        expect(await deletePopulation(existing.id)).toEqual({ ok: true });

        expect(await prisma.aquariumPopulation.count()).toBe(0);
        expect(await prisma.species.count()).toBe(2);
        expect(await prisma.aquarium.count()).toBe(1);
    });

    it('refuses an unknown population', async () => {
        await expect(deletePopulation(UNKNOWN_ID)).resolves.toEqual(
            failure(EERROR_MESSAGE.POPULATION_NOT_FOUND)
        );
    });
});
