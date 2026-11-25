import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EROLE } from '@/constants/enum/role.enum';
import type { Prisma } from '@/generated/prisma/client';
import type { ISpeciesCategoryDto } from '@/interface/dto/species-category.dto';
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
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryById,
    getCategoryOptions,
    updateCategory,
} from '@/actions/category.controller';

const NOT_AUTHENTICATED = 'Vous devez être connecté pour effectuer cette action.';
const FORBIDDEN = "Vous n'avez pas les droits pour effectuer cette action.";
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

type Account = Prisma.UserModel;
type Category = Prisma.SpeciesCategoryModel;

function signInAs(account: { id: string; role: string } | null): void {
    mocks.getServerSession.mockResolvedValue(
        account ? { user: { id: account.id, role: account.role } } : null
    );
}

function categoryForm(overrides: Partial<ISpeciesCategoryDto> = {}): ISpeciesCategoryDto {
    return { name: 'Cichlidés', description: 'Poissons territoriaux', ...overrides };
}

async function incompatibleNames(id: string): Promise<string[]> {
    const category = await getCategoryById(id);
    return category?.incompatibleCategories.map((c) => c.name) ?? [];
}

let admin: Account;
let user: Account;
let guppy: Category;
let shrimp: Category;

beforeEach(async () => {
    await resetDatabase();
    admin = await createTestUser({ role: EROLE.ADMIN });
    user = await createTestUser({ role: EROLE.USER });
    guppy = await prisma.speciesCategory.create({ data: { name: 'Guppys' } });
    shrimp = await prisma.speciesCategory.create({ data: { name: 'Crevettes' } });
    signInAs(admin);
});

describe('access control', () => {
    const actions = [
        ['getCategories', () => getCategories()],
        ['getCategoryById', () => getCategoryById(guppy.id)],
        ['getCategoryOptions', () => getCategoryOptions()],
        ['createCategory', () => createCategory(categoryForm())],
        ['updateCategory', () => updateCategory(guppy.id, categoryForm())],
        ['deleteCategory', () => deleteCategory(guppy.id)],
    ] as const;

    it.each(actions)('%s requires a signed-in user', async (_name, action) => {
        signInAs(null);
        await expect(action()).rejects.toThrow(NOT_AUTHENTICATED);
    });

    it.each(actions)('%s is forbidden to a USER', async (_name, action) => {
        signInAs(user);
        await expect(action()).rejects.toThrow(FORBIDDEN);
        expect(await prisma.speciesCategory.count()).toBe(2);
    });
});

describe('getCategories', () => {
    it('lists categories by name with their species counts', async () => {
        await createTestSpecies(guppy.id);
        await createTestSpecies([guppy.id, shrimp.id]);

        const categories = await getCategories();

        expect(
            categories.map((c) => [c.name, c.speciesCount, c.exclusiveSpeciesCount])
        ).toEqual([
            ['Crevettes', 1, 0],
            ['Guppys', 2, 1],
        ]);
    });

    it('lists light options sorted by name', async () => {
        await expect(getCategoryOptions()).resolves.toEqual([
            { id: shrimp.id, name: 'Crevettes' },
            { id: guppy.id, name: 'Guppys' },
        ]);
    });

    it('returns null for an unknown id', async () => {
        await expect(getCategoryById(UNKNOWN_ID)).resolves.toBeNull();
    });
});

describe('createCategory', () => {
    it('creates a trimmed category with symmetric incompatibilities', async () => {
        await createCategory(
            categoryForm({ name: '  Cichlidés  ', description: '  ', incompatibleWithIds: [guppy.id, shrimp.id] })
        );

        const created = await prisma.speciesCategory.findUniqueOrThrow({ where: { name: 'Cichlidés' } });
        expect(created.description).toBeNull();
        expect(await incompatibleNames(created.id)).toEqual(['Crevettes', 'Guppys']);
        expect(await incompatibleNames(guppy.id)).toEqual(['Cichlidés']);
        expect(await incompatibleNames(shrimp.id)).toEqual(['Cichlidés']);
    });

    it('refuses a duplicate name', async () => {
        await expect(createCategory(categoryForm({ name: 'Guppys' }))).rejects.toThrow(
            EERROR_MESSAGE.CATEGORY_NAME_TAKEN
        );
    });

    it('refuses a name that is too short', async () => {
        await expect(createCategory(categoryForm({ name: 'A' }))).rejects.toThrow(
            EERROR_MESSAGE.CATEGORY_NAME_TOO_SHORT
        );
    });

    it('refuses an unknown incompatible category', async () => {
        await expect(
            createCategory(categoryForm({ incompatibleWithIds: [UNKNOWN_ID] }))
        ).rejects.toThrow(EERROR_MESSAGE.CATEGORY_INCOMPATIBLE_INVALID);
        expect(await prisma.speciesCategory.count()).toBe(2);
    });
});

describe('updateCategory', () => {
    it('updates fields and keeps incompatibilities symmetric in both directions', async () => {
        const other = await createTestCategory();
        await updateCategory(guppy.id, categoryForm({ name: 'Guppys', incompatibleWithIds: [shrimp.id] }));
        expect(await incompatibleNames(shrimp.id)).toEqual(['Guppys']);

        // Removing the link from the other side removes it everywhere.
        await updateCategory(shrimp.id, categoryForm({ name: 'Crevettes', incompatibleWithIds: [other.id] }));

        expect(await incompatibleNames(guppy.id)).toEqual([]);
        expect(await incompatibleNames(shrimp.id)).toEqual([other.name]);
        expect(await incompatibleNames(other.id)).toEqual(['Crevettes']);
    });

    it('ignores the category itself in its incompatibilities', async () => {
        await updateCategory(guppy.id, categoryForm({ name: 'Guppys', incompatibleWithIds: [guppy.id] }));
        expect(await incompatibleNames(guppy.id)).toEqual([]);
    });

    it('allows keeping its own name but not taking another one', async () => {
        await expect(
            updateCategory(guppy.id, categoryForm({ name: 'Guppys', description: 'Vivipares' }))
        ).resolves.toBeUndefined();
        await expect(updateCategory(guppy.id, categoryForm({ name: 'Crevettes' }))).rejects.toThrow(
            EERROR_MESSAGE.CATEGORY_NAME_TAKEN
        );
    });

    it('refuses an unknown category', async () => {
        await expect(updateCategory(UNKNOWN_ID, categoryForm())).rejects.toThrow(
            EERROR_MESSAGE.CATEGORY_NOT_FOUND
        );
    });
});

describe('deleteCategory', () => {
    it('deletes the category, its own species and its incompatibility links', async () => {
        const own = await createTestSpecies(guppy.id);
        const shared = await createTestSpecies([guppy.id, shrimp.id]);
        await updateCategory(guppy.id, categoryForm({ name: 'Guppys', incompatibleWithIds: [shrimp.id] }));

        await deleteCategory(guppy.id);

        expect(await prisma.speciesCategory.findUnique({ where: { id: guppy.id } })).toBeNull();
        expect(await prisma.species.findUnique({ where: { id: own.id } })).toBeNull();
        // The shared species stays, attached to its other category only.
        await expect(
            prisma.species.findUniqueOrThrow({ where: { id: shared.id }, include: { categories: true } })
        ).resolves.toMatchObject({ categories: [{ id: shrimp.id }] });
        expect(await incompatibleNames(shrimp.id)).toEqual([]);
    });

    it('allows deletion when the species in an aquarium also belongs to another category', async () => {
        const shared = await createTestSpecies([guppy.id, shrimp.id]);
        const aquarium = await createTestAquarium(admin.id);
        await prisma.aquariumPopulation.create({
            data: { aquariumId: aquarium.id, speciesId: shared.id },
        });

        await expect(deleteCategory(guppy.id)).resolves.toBeUndefined();
        expect(await prisma.aquariumPopulation.count()).toBe(1);
    });

    it('refuses when one of its species lives in an aquarium', async () => {
        const species = await createTestSpecies(guppy.id);
        const aquarium = await createTestAquarium(admin.id);
        await prisma.aquariumPopulation.create({
            data: { aquariumId: aquarium.id, speciesId: species.id },
        });

        await expect(deleteCategory(guppy.id)).rejects.toThrow(
            EERROR_MESSAGE.CATEGORY_SPECIES_IN_AQUARIUM
        );
        expect(await prisma.species.count()).toBe(1);
    });

    it('refuses an unknown category', async () => {
        await expect(deleteCategory(UNKNOWN_ID)).rejects.toThrow(EERROR_MESSAGE.CATEGORY_NOT_FOUND);
    });
});
