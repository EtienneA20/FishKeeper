'use server';

import prisma from '@/lib/db';
import { DATA_ADMIN_ROLES } from '@/constants/enum/role.enum';
import { requireRole } from '@/lib/auth-guard';

/**
 * Exporte l'ensemble des données de l'application (sauvegarde).
 * Le hash des mots de passe est volontairement exclu.
 */
export async function exportAllData() {
    await requireRole(...DATA_ADMIN_ROLES);

    const [
        users,
        aquariums,
        waterMeasurements,
        targetRanges,
        alerts,
        speciesCategories,
        species,
        aquariumPopulations,
        maintenanceTemplates,
        maintenanceTasks,
        maintenanceLogs,
        equipment,
        consumables,
        notifications,
    ] = await Promise.all([
        prisma.user.findMany({ omit: { password: true } }),
        prisma.aquarium.findMany(),
        prisma.waterMeasurement.findMany(),
        prisma.targetRange.findMany(),
        prisma.alert.findMany(),
        prisma.speciesCategory.findMany(),
        prisma.species.findMany(),
        prisma.aquariumPopulation.findMany(),
        prisma.maintenanceTemplate.findMany(),
        prisma.maintenanceTask.findMany(),
        prisma.maintenanceLog.findMany(),
        prisma.equipment.findMany(),
        prisma.consumable.findMany(),
        prisma.notification.findMany(),
    ]);

    return {
        exportedAt: new Date().toISOString(),
        data: {
            users,
            aquariums,
            waterMeasurements,
            targetRanges,
            alerts,
            speciesCategories,
            species,
            aquariumPopulations,
            maintenanceTemplates,
            maintenanceTasks,
            maintenanceLogs,
            equipment,
            consumables,
            notifications,
        },
    };
}
