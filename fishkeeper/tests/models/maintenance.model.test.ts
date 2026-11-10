import { beforeEach, describe, expect, it } from 'vitest';

import { EConsumableType } from '@/constants/enum/consumable-type.enum';
import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';
import { EEquipmentType } from '@/constants/enum/equipment-type.enum';
import { EFrequency } from '@/constants/enum/frequency.enum';
import { EMaintenanceType } from '@/constants/enum/maintenance-type.enum';
import prisma from '@/lib/db';
import {
    createTestAquarium,
    createTestUser,
    resetDatabase,
} from '../helpers/factories';

let aquariumId: string;

beforeEach(async () => {
    await resetDatabase();
    const owner = await createTestUser();
    aquariumId = (await createTestAquarium(owner.id)).id;
});

const waterChange = {
    title: 'Changement d’eau',
    type: EMaintenanceType.WATER_CHANGE,
    frequency: EFrequency.WEEKLY,
};

describe('MaintenanceTask model (database)', () => {
    it('is active and repeats every period by default', async () => {
        const task = await prisma.maintenanceTask.create({
            data: { ...waterChange, nextDueAt: new Date(), aquariumId },
        });

        expect(task).toMatchObject({
            interval: 1,
            isActive: true,
            lastDoneAt: null,
        });
    });

    it('rejects an interval below 1', async () => {
        await expect(
            prisma.maintenanceTask.create({
                data: {
                    ...waterChange,
                    interval: 0,
                    nextDueAt: new Date(),
                    aquariumId,
                },
            })
        ).rejects.toThrow(
            'CHECK constraint failed: MaintenanceTask_interval_check'
        );
    });
});

describe('MaintenanceLog model (database)', () => {
    it('accepts a water change between 0 and 100 %', async () => {
        await prisma.maintenanceLog.create({
            data: {
                type: EMaintenanceType.WATER_CHANGE,
                waterPercent: 0,
                waterVolume: 0,
                aquariumId,
            },
        });
        await prisma.maintenanceLog.create({
            data: {
                type: EMaintenanceType.WATER_CHANGE,
                waterPercent: 100,
                aquariumId,
            },
        });

        expect(await prisma.maintenanceLog.count()).toBe(2);
    });

    it.each([
        [
            'a negative water volume',
            { waterVolume: -1 },
            'MaintenanceLog_waterVolume_check',
        ],
        [
            'a negative water percent',
            { waterPercent: -1 },
            'MaintenanceLog_waterPercent_check',
        ],
        [
            'a water percent above 100',
            { waterPercent: 101 },
            'MaintenanceLog_waterPercent_check',
        ],
    ])('rejects %s', async (_case, override, constraint) => {
        await expect(
            prisma.maintenanceLog.create({
                data: {
                    type: EMaintenanceType.WATER_CHANGE,
                    ...override,
                    aquariumId,
                },
            })
        ).rejects.toThrow(`CHECK constraint failed: ${constraint}`);
    });

    it('keeps the log history when its task is deleted', async () => {
        const task = await prisma.maintenanceTask.create({
            data: { ...waterChange, nextDueAt: new Date(), aquariumId },
        });
        const log = await prisma.maintenanceLog.create({
            data: {
                type: EMaintenanceType.WATER_CHANGE,
                taskId: task.id,
                aquariumId,
            },
        });

        await prisma.maintenanceTask.delete({ where: { id: task.id } });

        await expect(
            prisma.maintenanceLog.findUniqueOrThrow({ where: { id: log.id } })
        ).resolves.toMatchObject({ taskId: null });
    });
});

describe('MaintenanceTemplate model (database)', () => {
    it.each([
        [
            'an interval below 1',
            { interval: 0 },
            'MaintenanceTemplate_interval_check',
        ],
        [
            'a water percent above 100',
            { waterPercent: 120 },
            'MaintenanceTemplate_waterPercent_check',
        ],
    ])('rejects %s', async (_case, override, constraint) => {
        await expect(
            prisma.maintenanceTemplate.create({
                data: { ...waterChange, ...override },
            })
        ).rejects.toThrow(`CHECK constraint failed: ${constraint}`);
    });
});

describe('Equipment and Consumable models (database)', () => {
    it('marks new equipment as working', async () => {
        const equipment = await prisma.equipment.create({
            data: {
                name: 'Chauffage',
                type: EEquipmentType.HEATER,
                aquariumId,
            },
        });

        expect(equipment.status).toBe(EEquipmentStatus.WORKING);
    });

    it('rejects a maintenance interval of 0 days', async () => {
        await expect(
            prisma.equipment.create({
                data: {
                    name: 'Chauffage',
                    type: EEquipmentType.HEATER,
                    maintenanceInterval: 0,
                    aquariumId,
                },
            })
        ).rejects.toThrow(
            'CHECK constraint failed: Equipment_maintenanceInterval_check'
        );
    });

    it('accepts an empty consumable but rejects a negative quantity', async () => {
        const consumable = {
            name: 'Bactéries',
            type: EConsumableType.BACTERIA_STARTER,
            aquariumId,
        };
        await prisma.consumable.create({
            data: { ...consumable, quantity: 0 },
        });

        await expect(
            prisma.consumable.create({ data: { ...consumable, quantity: -1 } })
        ).rejects.toThrow('CHECK constraint failed: Consumable_quantity_check');
    });
});
