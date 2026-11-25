'use server';

import { validate } from 'class-validator';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { requireRole } from '@/lib/auth-guard';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { IEquipmentDto } from '@/interface/dto/equipment.dto';
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

function emptyToUndefined(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

async function validateEquipmentDto(equipmentDto: IEquipmentDto): Promise<IEquipmentDto> {
    const dto = Object.assign(new IEquipmentDto(), equipmentDto);
    dto.name = dto.name?.trim();
    dto.brand = emptyToUndefined(dto.brand);
    dto.model = emptyToUndefined(dto.model);
    dto.purchasedAt = emptyToUndefined(dto.purchasedAt);
    dto.notes = emptyToUndefined(dto.notes);
    dto.imageURL = emptyToUndefined(dto.imageURL);

    const errors = await validate(dto, { whitelist: true });
    if (errors.length > 0) {
        const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
        throw new Error(messages.join(' ') || EERROR_MESSAGE.EQUIPMENT_VALIDATION);
    }
    return dto;
}

export async function createEquipment(equipmentDto: IEquipmentDto): Promise<void> {
    const session = await requireRole();
    const dto = await validateEquipmentDto(equipmentDto);

    const aquarium = await prisma.aquarium.findFirst({
        where: { id: dto.aquariumId, ownerId: session.user.id },
    });
    if (!aquarium) {
        throw new Error(EERROR_MESSAGE.EQUIPMENT_AQUARIUM_INVALID);
    }

    await prisma.equipment.create({
        data: {
            name: dto.name,
            type: dto.type,
            status: dto.status,
            brand: dto.brand ?? null,
            model: dto.model ?? null,
            maintenanceInterval: dto.maintenanceInterval ?? null,
            purchasedAt: dto.purchasedAt ? new Date(dto.purchasedAt) : null,
            imageURL: dto.imageURL ?? null,
            notes: dto.notes ?? null,
            aquariumId: aquarium.id,
        },
    });

    revalidatePath('/materiel');
}
