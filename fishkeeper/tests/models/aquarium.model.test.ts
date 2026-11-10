import { beforeEach, describe, expect, it } from 'vitest';

import { EAquariumCycle } from '@/constants/enum/aqurarium-cycle.enum';
import { EConsumableType } from '@/constants/enum/consumable-type.enum';
import { EEquipmentType } from '@/constants/enum/equipment-type.enum';
import { EFrequency } from '@/constants/enum/frequency.enum';
import { EMaintenanceType } from '@/constants/enum/maintenance-type.enum';
import { EWaterParameter } from '@/constants/enum/water-parameter.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';
import prisma from '@/lib/db';
import {
    createTestAquarium,
    createTestCategory,
    createTestSpecies,
    createTestUser,
    resetDatabase,
} from '../helpers/factories';

describe('Aquarium model (database)', () => {
    let ownerId: string;

    beforeEach(async () => {
        await resetDatabase();
        ownerId = (await createTestUser()).id;
    });

    it('applies the default water type and cycle', async () => {
        const aquarium = await createTestAquarium(ownerId);

        expect(aquarium.waterType).toBe(EWaterType.FRESH_SOFT);
        expect(aquarium.cycle).toBe(EAquariumCycle.CYCLING);
    });

    it('accepts a net volume equal to the gross volume', async () => {
        await expect(
            createTestAquarium(ownerId, { grossVolume: 100, netVolume: 100 })
        ).resolves.toMatchObject({ netVolume: 100 });
    });

    it.each([
        [
            'a zero gross volume',
            { grossVolume: 0, netVolume: 0 },
            'Aquarium_grossVolume_check',
        ],
        [
            'a zero net volume',
            { grossVolume: 100, netVolume: 0 },
            'Aquarium_netVolume_check',
        ],
        [
            'a negative net volume',
            { grossVolume: 100, netVolume: -5 },
            'Aquarium_netVolume_check',
        ],
        [
            'a net volume above the gross volume',
            { grossVolume: 100, netVolume: 120 },
            'Aquarium_netVolume_lte_gross_check',
        ],
    ])('rejects %s', async (_case, volumes, constraint) => {
        await expect(createTestAquarium(ownerId, volumes)).rejects.toThrow(
            `CHECK constraint failed: ${constraint}`
        );
    });

    it('rejects an aquarium whose owner does not exist', async () => {
        await expect(createTestAquarium('missing-owner')).rejects.toMatchObject(
            { code: 'P2003' }
        );
    });

    it('deletes all the data attached to a deleted aquarium, but keeps the species', async () => {
        const aquarium = await createTestAquarium(ownerId);
        const aquariumId = aquarium.id;
        const species = await createTestSpecies(
            (await createTestCategory()).id
        );
        const task = await prisma.maintenanceTask.create({
            data: {
                title: 'Changement d’eau',
                type: EMaintenanceType.WATER_CHANGE,
                frequency: EFrequency.WEEKLY,
                nextDueAt: new Date(),
                aquariumId,
            },
        });
        await prisma.maintenanceLog.create({
            data: {
                type: EMaintenanceType.WATER_CHANGE,
                taskId: task.id,
                aquariumId,
            },
        });
        await prisma.waterMeasurement.create({ data: { ph: 7, aquariumId } });
        await prisma.targetRange.create({
            data: {
                parameter: EWaterParameter.PH,
                dangerMin: 6,
                dangerMax: 8,
                aquariumId,
            },
        });
        await prisma.equipment.create({
            data: {
                name: 'Filtre',
                type: EEquipmentType.FILTER_CANISTER,
                aquariumId,
            },
        });
        await prisma.consumable.create({
            data: {
                name: 'Conditionneur',
                type: EConsumableType.WATER_CONDITIONER,
                aquariumId,
            },
        });
        await prisma.aquariumPopulation.create({
            data: { aquariumId, speciesId: species.id },
        });

        await prisma.aquarium.delete({ where: { id: aquariumId } });

        const remaining = await Promise.all([
            prisma.maintenanceTask.count(),
            prisma.maintenanceLog.count(),
            prisma.waterMeasurement.count(),
            prisma.targetRange.count(),
            prisma.equipment.count(),
            prisma.consumable.count(),
            prisma.aquariumPopulation.count(),
        ]);
        expect(remaining).toEqual([0, 0, 0, 0, 0, 0, 0]);
        expect(await prisma.species.count()).toBe(1);
    });
});
