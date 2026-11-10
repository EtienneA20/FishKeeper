import { beforeEach, describe, expect, it } from 'vitest';

import prisma from '@/lib/db';
import {
    createTestAquarium,
    createTestCategory,
    createTestSpecies,
    createTestUser,
    resetDatabase,
} from '../helpers/factories';

describe('Species and population models (database)', () => {
    let categoryId: string;

    beforeEach(async () => {
        await resetDatabase();
        categoryId = (await createTestCategory()).id;
    });

    it('accepts a species whose minimum and maximum are equal', async () => {
        await expect(
            createTestSpecies(categoryId, {
                minTemperature: 24,
                maxTemperature: 24,
                minPh: 7,
                maxPh: 7,
                minGh: 0,
                maxGh: 0,
                minKh: 0,
                maxKh: 0,
                minVolume: 0,
            })
        ).resolves.toMatchObject({ minTemperature: 24 });
    });

    it.each([
        [
            'minTemperature below 0',
            { minTemperature: -1 },
            'Species_minTemperature_check',
        ],
        [
            'maxTemperature above 50',
            { maxTemperature: 51 },
            'Species_maxTemperature_check',
        ],
        [
            'a temperature range in the wrong order',
            { minTemperature: 28, maxTemperature: 22 },
            'Species_temperature_order_check',
        ],
        ['minPh below 0', { minPh: -1 }, 'Species_minPh_check'],
        ['maxPh above 14', { maxPh: 14.5 }, 'Species_maxPh_check'],
        [
            'a pH range in the wrong order',
            { minPh: 7.5, maxPh: 6.5 },
            'Species_ph_order_check',
        ],
        ['a negative minGh', { minGh: -1 }, 'Species_minGh_check'],
        ['a negative maxGh', { maxGh: -1 }, 'Species_maxGh_check'],
        [
            'a GH range in the wrong order',
            { minGh: 10, maxGh: 5 },
            'Species_gh_order_check',
        ],
        ['a negative minKh', { minKh: -1 }, 'Species_minKh_check'],
        ['a negative maxKh', { maxKh: -1 }, 'Species_maxKh_check'],
        [
            'a KH range in the wrong order',
            { minKh: 8, maxKh: 2 },
            'Species_kh_order_check',
        ],
        [
            'a negative minimum volume',
            { minVolume: -1 },
            'Species_minVolume_check',
        ],
    ])('rejects %s', async (_case, override, constraint) => {
        await expect(createTestSpecies(categoryId, override)).rejects.toThrow(
            `CHECK constraint failed: ${constraint}`
        );
    });

    it('refuses duplicate species and category names', async () => {
        const species = await createTestSpecies(categoryId);
        const category = await prisma.speciesCategory.findUniqueOrThrow({
            where: { id: categoryId },
        });

        await expect(
            createTestSpecies(categoryId, { name: species.name })
        ).rejects.toMatchObject({ code: 'P2002' });
        await expect(
            prisma.speciesCategory.create({ data: { name: category.name } })
        ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('refuses to delete a category that still has species', async () => {
        await createTestSpecies(categoryId);

        await expect(
            prisma.speciesCategory.delete({ where: { id: categoryId } })
        ).rejects.toMatchObject({ code: 'P2003' });
    });

    describe('AquariumPopulation', () => {
        let aquariumId: string;
        let speciesId: string;

        beforeEach(async () => {
            const owner = await createTestUser();
            aquariumId = (await createTestAquarium(owner.id)).id;
            speciesId = (await createTestSpecies(categoryId)).id;
        });

        it('refuses to delete a species that lives in an aquarium', async () => {
            await prisma.aquariumPopulation.create({
                data: { aquariumId, speciesId },
            });

            await expect(
                prisma.species.delete({ where: { id: speciesId } })
            ).rejects.toMatchObject({ code: 'P2003' });
        });

        it('adds a species only once to the same aquarium', async () => {
            await prisma.aquariumPopulation.create({
                data: { aquariumId, speciesId },
            });

            await expect(
                prisma.aquariumPopulation.create({
                    data: { aquariumId, speciesId },
                })
            ).rejects.toMatchObject({ code: 'P2002' });
        });

        it.each([
            ['size', 'AquariumPopulation_size_check'],
            ['weight', 'AquariumPopulation_weight_check'],
        ])('rejects a negative %s', async (field, constraint) => {
            await expect(
                prisma.aquariumPopulation.create({
                    data: { aquariumId, speciesId, [field]: -1 },
                })
            ).rejects.toThrow(`CHECK constraint failed: ${constraint}`);
        });
    });
});
