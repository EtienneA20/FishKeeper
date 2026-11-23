import { beforeEach, describe, expect, it } from 'vitest';

import { ENotificationType } from '@/constants/enum/notification-type.enum';
import { EROLE } from '@/constants/enum/role.enum';
import prisma from '@/lib/db';
import {
    createTestAquarium,
    createTestUser,
    resetDatabase,
} from '../helpers/factories';

describe('User model (database)', () => {
    beforeEach(resetDatabase);

    it('gives a new account the USER role and optional fields set to null', async () => {
        const user = await prisma.user.create({
            data: {
                name: 'Nemo',
                email: 'nemo@example.test',
                password: 'hash',
            },
        });

        expect(user.role).toBe(EROLE.USER);
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.departement).toBeNull();
        expect(user.imageURL).toBeNull();
    });

    it('refuses two accounts with the same e-mail', async () => {
        await createTestUser({ email: 'same@example.test' });

        await expect(
            createTestUser({ email: 'same@example.test' })
        ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('deletes the aquariums and notifications of a deleted user', async () => {
        const user = await createTestUser();
        const otherUser = await createTestUser();
        await createTestAquarium(user.id);
        await createTestAquarium(otherUser.id);
        await prisma.notification.create({
            data: {
                type: ENotificationType.WATER_ALERT,
                subject: 'pH trop bas',
                body: 'Le pH est descendu sous le seuil.',
                userId: user.id,
            },
        });

        await prisma.user.delete({ where: { id: user.id } });

        expect(await prisma.aquarium.count()).toBe(1);
        expect(await prisma.notification.count()).toBe(0);
    });
});
