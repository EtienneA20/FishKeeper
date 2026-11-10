import { hash } from 'bcryptjs';

import { EROLE } from '@/constants/enum/role.enum';
import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/db';

export const TEST_PASSWORD = 'Fishkeeper-test-123!';

let sequence = 0;
function nextId(): number {
    sequence += 1;
    return sequence;
}

/** Empties every table. Deleting users cascades to aquariums and all their data. */
export async function resetDatabase(): Promise<void> {
    await prisma.user.deleteMany();
    await prisma.species.deleteMany();
    await prisma.speciesCategory.deleteMany();
    await prisma.maintenanceTemplate.deleteMany();
}

export async function createTestUser(
    overrides: Partial<Prisma.UserCreateInput> = {}
): Promise<Prisma.UserModel> {
    const id = nextId();
    return prisma.user.create({
        data: {
            name: `Test user ${id}`,
            email: `user-${id}@example.test`,
            // Low bcrypt cost keeps fixtures fast; the app itself uses 12.
            password: await hash(TEST_PASSWORD, 4),
            role: EROLE.USER,
            departement: 'Tests',
            ...overrides,
        },
    });
}

export async function createTestAquarium(
    ownerId: string,
    overrides: Partial<Prisma.AquariumUncheckedCreateInput> = {}
): Promise<Prisma.AquariumModel> {
    return prisma.aquarium.create({
        data: {
            name: `Bac ${nextId()}`,
            grossVolume: 120,
            netVolume: 100,
            ownerId,
            ...overrides,
        },
    });
}

export async function createTestCategory(): Promise<Prisma.SpeciesCategoryModel> {
    return prisma.speciesCategory.create({
        data: { name: `Catégorie ${nextId()}` },
    });
}

export async function createTestSpecies(
    categoryId: string,
    overrides: Partial<Prisma.SpeciesUncheckedCreateInput> = {}
): Promise<Prisma.SpeciesModel> {
    return prisma.species.create({
        data: { name: `Espèce ${nextId()}`, categoryId, ...overrides },
    });
}
