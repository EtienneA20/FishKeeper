'use server';

import prisma from '@/lib/db';
import { requireRole } from '@/lib/auth-guard';
import { IAquarium } from '@/interface/entity/aquarium.entity';

export async function getMyAquariums(): Promise<Pick<IAquarium, 'id' | 'name'>[]> {
    const session = await requireRole();

    return prisma.aquarium.findMany({
        where: { ownerId: session.user.id },
        select: { id: true, name: true },
        orderBy: { createdAt: 'asc' },
    });
}
