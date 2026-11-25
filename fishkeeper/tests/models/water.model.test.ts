import { beforeEach, describe, expect, it } from 'vitest';

import { EAlertDirection } from '@/constants/enum/alert-direction.enum';
import { EAlertSeverity } from '@/constants/enum/alert-severity.enum';
import { EWaterParameter } from '@/constants/enum/water-parameter.enum';
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

describe('WaterMeasurement model (database)', () => {
    it('accepts an empty measurement and values on the limits', async () => {
        await prisma.waterMeasurement.create({ data: { aquariumId } });
        await prisma.waterMeasurement.create({
            data: {
                temperature: 0,
                ph: 0,
                no2: 0,
                no3: 0,
                nh4: 0,
                gh: 0,
                kh: 0,
                aquariumId,
            },
        });
        await prisma.waterMeasurement.create({
            data: { temperature: 50, ph: 14, aquariumId },
        });

        expect(await prisma.waterMeasurement.count()).toBe(3);
    });

    it.each([
        ['temperature', -0.1],
        ['temperature', 50.1],
        ['ph', -0.1],
        ['ph', 14.1],
        ['no2', -1],
        ['no3', -1],
        ['nh4', -1],
        ['gh', -1],
        ['kh', -1],
    ])('rejects %s = %s', async (field, value) => {
        await expect(
            prisma.waterMeasurement.create({
                data: { [field]: value, aquariumId },
            })
        ).rejects.toThrow(
            `CHECK constraint failed: WaterMeasurement_${field}_check`
        );
    });
});

describe('TargetRange model (database)', () => {
    const validRange = {
        parameter: EWaterParameter.PH,
        warningMin: 6,
        warningMax: 7.5,
        dangerMin: 6.5,
        dangerMax: 8,
    };

    it('accepts a range that follows every rule, with or without warning bounds', async () => {
        await prisma.targetRange.create({
            data: { ...validRange, aquariumId },
        });
        await prisma.targetRange.create({
            data: {
                parameter: EWaterParameter.KH,
                dangerMin: 4,
                dangerMax: 4,
                aquariumId,
            },
        });

        expect(await prisma.targetRange.count()).toBe(2);
    });

    it.each([
        [
            'dangerMin above dangerMax',
            { dangerMin: 9 },
            'TargetRange_danger_order_check',
        ],
        [
            'warningMin above warningMax',
            { warningMin: 6.4, warningMax: 6 },
            'TargetRange_warning_order_check',
        ],
        [
            'warningMin not below dangerMin',
            { warningMin: 6.5 },
            'TargetRange_warningMin_in_danger_check',
        ],
        [
            'warningMax not below dangerMax',
            { warningMax: 8 },
            'TargetRange_warningMax_in_danger_check',
        ],
    ])('rejects %s', async (_case, override, constraint) => {
        await expect(
            prisma.targetRange.create({
                data: { ...validRange, ...override, aquariumId },
            })
        ).rejects.toThrow(`CHECK constraint failed: ${constraint}`);
    });

    it('allows one range per parameter and per aquarium', async () => {
        const owner = await createTestUser();
        const otherAquarium = await createTestAquarium(owner.id);
        await prisma.targetRange.create({
            data: { ...validRange, aquariumId },
        });
        await prisma.targetRange.create({
            data: { ...validRange, aquariumId: otherAquarium.id },
        });

        await expect(
            prisma.targetRange.create({ data: { ...validRange, aquariumId } })
        ).rejects.toMatchObject({ code: 'P2002' });
    });
});

describe('Alert model (database)', () => {
    it('keeps an alert when its measurement and target range are deleted', async () => {
        const measurement = await prisma.waterMeasurement.create({
            data: { ph: 5.5, aquariumId },
        });
        const range = await prisma.targetRange.create({
            data: {
                parameter: EWaterParameter.PH,
                dangerMin: 6,
                dangerMax: 8,
                aquariumId,
            },
        });
        const alert = await prisma.alert.create({
            data: {
                parameter: EWaterParameter.PH,
                value: 5.5,
                targetLimit: 6,
                direction: EAlertDirection.TOO_LOW,
                severity: EAlertSeverity.CRITICAL,
                aquariumId,
                measurementId: measurement.id,
                targetRangeId: range.id,
            },
        });

        await prisma.waterMeasurement.delete({ where: { id: measurement.id } });
        await prisma.targetRange.delete({ where: { id: range.id } });

        await expect(
            prisma.alert.findUniqueOrThrow({ where: { id: alert.id } })
        ).resolves.toMatchObject({
            measurementId: null,
            targetRangeId: null,
            resolved: false,
        });
    });
});
