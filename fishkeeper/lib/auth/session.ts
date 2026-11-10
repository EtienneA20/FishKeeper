import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { EROLE } from '@/constants/enum/role.enum';
import prisma from '@/lib/db';
import type { RoleHolder } from './authorization';

/**
 * Returns the signed-in user with the role currently stored in the database.
 * The JWT only holds the role from login time, so authorization must not trust it:
 * a demoted or deleted account loses its rights immediately.
 */
export async function getSessionActor(): Promise<RoleHolder | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
    });

    return user ? { id: user.id, role: user.role as EROLE } : null;
}
