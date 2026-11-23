'use server';

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
