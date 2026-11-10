import { compare } from 'bcryptjs';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EROLE } from '@/constants/enum/role.enum';
import prisma from '@/lib/db';
import {
    createTestUser,
    resetDatabase,
    TEST_PASSWORD,
} from '../helpers/factories';

// auth.ts refuses to load without a secret; this runs before the imports below.
vi.hoisted(() => {
    process.env.NEXTAUTH_SECRET = 'fishkeeper-integration-test-secret';
});

import { registerUser } from '@/actions/auth.controller';
import { authOptions } from '@/auth';

type Credentials = { email?: string; password?: string };

/** The `authorize` function written in auth.ts (next-auth keeps it under `options`). */
function authorize(credentials: Credentials): Promise<User | null> {
    const provider = authOptions.providers[0] as unknown as {
        options: {
            authorize: (
                credentials: Credentials,
                request: unknown
            ) => Promise<User | null>;
        };
    };
    return provider.options.authorize(credentials, {});
}

const registration = {
    name: '  New Aquarist ',
    email: ' NEW.USER@EXAMPLE.TEST ',
    departement: 'Aquariophilie',
    password: 'fishkeeper-test-password',
    imageUrl: '',
};

beforeEach(resetDatabase);

describe('registration', () => {
    it('creates a USER account with a lowercase e-mail and a hashed password', async () => {
        await registerUser(registration);

        const account = await prisma.user.findUniqueOrThrow({
            where: { email: 'new.user@example.test' },
        });
        expect(account).toMatchObject({
            name: 'New Aquarist',
            role: EROLE.USER,
            imageURL: null,
        });
        await expect(
            compare(registration.password, account.password)
        ).resolves.toBe(true);
    });

    it('refuses an e-mail that is already used, whatever its case', async () => {
        await createTestUser({ email: 'new.user@example.test' });

        await expect(registerUser(registration)).rejects.toThrow(
            'Cette adresse e-mail est déjà utilisée.'
        );
    });

    it.each([
        ['a password shorter than 8 characters', { password: 'short' }],
        ['an e-mail without @', { email: 'not-an-email' }],
        ['a one-letter name', { name: 'A' }],
    ])('refuses %s', async (_case, override) => {
        await expect(
            registerUser({ ...registration, ...override })
        ).rejects.toThrow();
        expect(await prisma.user.count()).toBe(0);
    });
});

describe('login', () => {
    it.each(Object.values(EROLE))(
        'returns the %s role of the account',
        async (role) => {
            const account = await createTestUser({
                role,
                email: 'login@example.test',
            });

            await expect(
                authorize({
                    email: ' LOGIN@example.test ',
                    password: TEST_PASSWORD,
                })
            ).resolves.toEqual({
                id: account.id,
                name: account.name,
                email: account.email,
                role,
            });
        }
    );

    it('lets a newly registered account log in', async () => {
        await registerUser(registration);

        await expect(
            authorize({
                email: registration.email,
                password: registration.password,
            })
        ).resolves.toMatchObject({
            email: 'new.user@example.test',
            role: EROLE.USER,
        });
    });

    it.each([
        [
            'a wrong password',
            { email: 'login@example.test', password: 'wrong-password' },
        ],
        [
            'an unknown e-mail',
            { email: 'nobody@example.test', password: TEST_PASSWORD },
        ],
        ['a missing password', { email: 'login@example.test' }],
    ])('refuses %s', async (_case, credentials) => {
        await createTestUser({ email: 'login@example.test' });

        await expect(authorize(credentials)).resolves.toBeNull();
    });

    it('copies the id and role into the token, then into the session', async () => {
        const { jwt, session } = authOptions.callbacks!;
        const user = { id: 'account-id', role: EROLE.ADMIN } as User;

        const token = (await jwt!({ token: {} as JWT, user } as never)) as JWT;
        const result = (await session!({
            session: { user: {}, expires: '' } as Session,
            token,
        } as never)) as Session;

        expect(token).toMatchObject({ id: 'account-id', role: EROLE.ADMIN });
        expect(result.user).toMatchObject({
            id: 'account-id',
            role: EROLE.ADMIN,
        });
    });
});
