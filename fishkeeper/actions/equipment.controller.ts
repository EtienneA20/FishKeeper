'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { requireRole } from '@/lib/auth-guard';
import { IEquipment } from '@/interface/entity/equipment.entity';
import { EEquipmentType } from '@/constants/enum/equipment-type.enum';
import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';


export async function getMyEquipments(): Promise<IEquipment[]> {
    const session = await requireRole();

    const equipments = await prisma.equipment.findMany({
        where: { aquarium: { ownerId: session.user.id } },
        orderBy: { name: 'asc' },
    });

    return equipments.map((equipment) => ({
        ...equipment,
        type: equipment.type as EEquipmentType,
        status: equipment.status as EEquipmentStatus,
    }));
}

function textOrNull(value: string | undefined): string | null {
    const trimmed = value?.trim() ?? '';
    return trimmed === '' ? null : trimmed;
}

export async function createEquipment(values: Record<string, string>): Promise<void> {
    const session = await requireRole();

    const name = textOrNull(values.name);
    if (!name) {
        throw new Error('Le nom est obligatoire.');
    }

    const aquarium = await prisma.aquarium.findFirst({
        where: { id: values.aquariumId, ownerId: session.user.id },
    });
    if (!aquarium) {
        throw new Error('Aquarium invalide.');
    }

    const type = values.type as EEquipmentType;
    const status = values.status as EEquipmentStatus;

    const maintenanceInterval = textOrNull(values.maintenanceInterval);
    const purchasedAt = textOrNull(values.purchasedAt);

    await prisma.equipment.create({
        data: {
            name,
            type,
            status,
            brand: textOrNull(values.brand),
            model: textOrNull(values.model),
            maintenanceInterval: maintenanceInterval ? Number(maintenanceInterval) : null,
            purchasedAt: purchasedAt ? new Date(purchasedAt) : null,
            imageURL: textOrNull(values.imageURL),
            notes: textOrNull(values.notes),
            aquariumId: aquarium.id,
        },
    });

    revalidatePath('/materiel');
}
