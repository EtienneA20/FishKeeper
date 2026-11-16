import { compare } from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EROLE } from '@/constants/enum/role.enum';
import type { Prisma } from '@/generated/prisma/client';
import type { IUserDto } from '@/interface/dto/user.dto';
import prisma from '@/lib/db';
import { createTestUser, resetDatabase } from '../helpers/factories';

// Only the Next.js request context is faked. Prisma runs against a real SQLite
// database built from prisma/migrations (see tests/setup).
const mocks = vi.hoisted(() => ({ getServerSession: vi.fn() }));
vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }));
vi.mock('@/auth', () => ({ authOptions: {} }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from '@/actions/user.controller';

// Messages thrown by lib/auth-guard.ts and actions/user.controller.ts.
const NOT_AUTHENTICATED =
    'Vous devez être connecté pour effectuer cette action.';
const FORBIDDEN = "Vous n'avez pas les droits pour effectuer cette action.";
const SELF_ADMIN_RIGHTS =
    'Vous ne pouvez pas retirer vos propres droits d’administration.';

type Account = Prisma.UserModel;

/** Fakes the login token; `role` lets a test send a stale role on purpose. */
function signInAs(account: { id: string; role: string } | null): void {
    mocks.getServerSession.mockResolvedValue(
        account ? { user: { id: account.id, role: account.role } } : null
    );
}

/** What the user form sends to the server actions. */
function userForm(overrides: Partial<IUserDto> = {}): IUserDto {
    return {
        name: 'Nouvel utilisateur',
        email: 'new@example.test',
        role: EROLE.USER,
        departement: 'Aquariophilie',
        password: 'fishkeeper-test-password',
        ...overrides,
    } as IUserDto;
}

/** The form for an existing account, with its current values. */
function editForm(
    account: Account,
    overrides: Partial<IUserDto> = {}
): IUserDto {
    return userForm({
        name: account.name,
        email: account.email,
        role: account.role as EROLE,
        departement: account.departement ?? 'Tests',
        password: '',
        ...overrides,
    });
}

async function findAccount(id: string): Promise<Account | null> {
    return prisma.user.findUnique({ where: { id } });
}

let sudo: Account;
let admin: Account;
let user: Account;

beforeEach(async () => {
    await resetDatabase();
    sudo = await createTestUser({ role: EROLE.SUDO, name: 'Sudo' });
    admin = await createTestUser({ role: EROLE.ADMIN, name: 'Admin' });
    user = await createTestUser({ role: EROLE.USER, name: 'User' });
    signInAs(null);
});

describe('access control', () => {
    const actions = [
        ['getUsers', () => getUsers()],
        ['getUserById', () => getUserById(user.id)],
        ['createUser', () => createUser(userForm())],
        [
            'updateUser',
            () => updateUser(user.id, editForm(user, { name: 'Changed' })),
        ],
        ['deleteUser', () => deleteUser(user.id)],
    ] as const;

    it.each(actions)('%s requires a signed-in user', async (_name, action) => {
        await expect(action()).rejects.toThrow(NOT_AUTHENTICATED);
    });

    it.each(actions)('%s is forbidden to a USER', async (_name, action) => {
        signInAs(user);

        await expect(action()).rejects.toThrow(FORBIDDEN);
        expect(await prisma.user.count()).toBe(3);
        expect(await findAccount(user.id)).toMatchObject({ name: 'User' });
    });

    // Security expectations that requireRole() does not meet yet: it trusts the role
    // stored in the login token instead of reading the account from the database.
    it('rejects a login token whose account was deleted', async () => {
        signInAs({ id: 'deleted-account', role: EROLE.SUDO });

        await expect(getUsers()).rejects.toThrow();
    });

    it('uses the role stored in the database, not the role in the login token', async () => {
        await prisma.user.update({
            where: { id: admin.id },
            data: { role: EROLE.USER },
        });
        signInAs({ id: admin.id, role: EROLE.ADMIN });

        await expect(getUsers()).rejects.toThrow(FORBIDDEN);
    });
});

describe('reading accounts', () => {
    it.each([EROLE.ADMIN, EROLE.SUDO])(
        '%s sees every account, SUDO included, without password hashes',
        async (role) => {
            signInAs(role === EROLE.ADMIN ? admin : sudo);

            const accounts = await getUsers();

            expect(accounts.map((account) => account.email).sort()).toEqual(
                [sudo, admin, user].map((account) => account.email).sort()
            );
            for (const account of accounts) {
                expect(account).not.toHaveProperty('password');
            }
        }
    );

    it('returns one account without its password hash, or null', async () => {
        signInAs(admin);

        const account = await getUserById(sudo.id);

        expect(account).toMatchObject({ id: sudo.id, role: EROLE.SUDO });
        expect(account).not.toHaveProperty('password');
        await expect(getUserById('missing')).resolves.toBeNull();
    });
});

describe('ADMIN', () => {
    beforeEach(() => signInAs(admin));

    it('creates a USER account with a hashed password and a lowercase e-mail', async () => {
        await createUser(userForm({ email: '  New.User@Example.TEST ' }));

        const created = await prisma.user.findUniqueOrThrow({
            where: { email: 'new.user@example.test' },
        });
        expect(created.role).toBe(EROLE.USER);
        expect(created.password).not.toBe('fishkeeper-test-password');
        await expect(
            compare('fishkeeper-test-password', created.password)
        ).resolves.toBe(true);
    });

    it.each([EROLE.ADMIN, EROLE.SUDO])(
        'cannot create a %s account',
        async (role) => {
            await expect(createUser(userForm({ role }))).rejects.toThrow(
                FORBIDDEN
            );
            expect(await prisma.user.count()).toBe(3);
        }
    );

    it('edits a USER account and keeps its password when the field is left empty', async () => {
        await updateUser(user.id, editForm(user, { name: 'Renamed' }));

        expect(await findAccount(user.id)).toMatchObject({
            name: 'Renamed',
            password: user.password,
        });
    });

    it('cannot promote a USER', async () => {
        await expect(
            updateUser(user.id, editForm(user, { role: EROLE.ADMIN }))
        ).rejects.toThrow(FORBIDDEN);
        expect(await findAccount(user.id)).toMatchObject({ role: EROLE.USER });
    });

    it.each([EROLE.ADMIN, EROLE.SUDO])(
        'cannot edit or delete a %s account',
        async (role) => {
            const target =
                role === EROLE.SUDO
                    ? sudo
                    : await createTestUser({ role: EROLE.ADMIN });

            await expect(
                updateUser(
                    target.id,
                    editForm(target, { name: 'Changed', role: EROLE.USER })
                )
            ).rejects.toThrow(FORBIDDEN);
            await expect(deleteUser(target.id)).rejects.toThrow(FORBIDDEN);
            expect(await findAccount(target.id)).toMatchObject({
                name: target.name,
                role,
            });
        }
    );

    it('deletes a USER account', async () => {
        await deleteUser(user.id);

        expect(await findAccount(user.id)).toBeNull();
    });

    // Expected behaviour, not implemented yet: updateUser() treats the ADMIN's own
    // account like any other ADMIN account and refuses the change.
    it('edits their own profile', async () => {
        await updateUser(admin.id, editForm(admin, { name: 'Admin renamed' }));

        expect(await findAccount(admin.id)).toMatchObject({
            name: 'Admin renamed',
        });
    });

    it.each([EROLE.USER, EROLE.SUDO])(
        'cannot change their own role to %s',
        async (role) => {
            await expect(
                updateUser(admin.id, editForm(admin, { role }))
            ).rejects.toThrow();
            expect(await findAccount(admin.id)).toMatchObject({
                role: EROLE.ADMIN,
            });
        }
    );

    it('cannot delete their own account', async () => {
        await expect(deleteUser(admin.id)).rejects.toThrow(
            EERROR_MESSAGE.USER_SELF_DELETE
        );
        expect(await findAccount(admin.id)).not.toBeNull();
    });
});

describe('SUDO', () => {
    beforeEach(() => signInAs(sudo));

    it.each(Object.values(EROLE))('creates a %s account', async (role) => {
        await createUser(userForm({ role }));

        await expect(
            prisma.user.findUniqueOrThrow({
                where: { email: 'new@example.test' },
            })
        ).resolves.toMatchObject({ role });
    });

    it('promotes a USER to ADMIN and demotes an ADMIN to USER', async () => {
        await updateUser(user.id, editForm(user, { role: EROLE.ADMIN }));
        await updateUser(admin.id, editForm(admin, { role: EROLE.USER }));

        expect(await findAccount(user.id)).toMatchObject({ role: EROLE.ADMIN });
        expect(await findAccount(admin.id)).toMatchObject({ role: EROLE.USER });
    });

    it('edits and deletes ADMIN and other SUDO accounts', async () => {
        const otherSudo = await createTestUser({ role: EROLE.SUDO });

        await updateUser(
            otherSudo.id,
            editForm(otherSudo, { name: 'Renamed' })
        );
        expect(await findAccount(otherSudo.id)).toMatchObject({
            name: 'Renamed',
        });

        await deleteUser(admin.id);
        await deleteUser(otherSudo.id);
        expect(await prisma.user.count()).toBe(2);
    });

    it('edits their own profile', async () => {
        await updateUser(sudo.id, editForm(sudo, { name: 'Sudo renamed' }));

        expect(await findAccount(sudo.id)).toMatchObject({
            name: 'Sudo renamed',
        });
    });

    it('cannot delete their own account or remove their own admin rights', async () => {
        await expect(deleteUser(sudo.id)).rejects.toThrow(
            EERROR_MESSAGE.USER_SELF_DELETE
        );
        await expect(
            updateUser(sudo.id, editForm(sudo, { role: EROLE.USER }))
        ).rejects.toThrow(SELF_ADMIN_RIGHTS);
        expect(await findAccount(sudo.id)).toMatchObject({ role: EROLE.SUDO });
    });

    it('can change their own role to ADMIN (they keep admin rights)', async () => {
        await updateUser(sudo.id, editForm(sudo, { role: EROLE.ADMIN }));

        expect(await findAccount(sudo.id)).toMatchObject({ role: EROLE.ADMIN });
    });
});

describe('input handling', () => {
    beforeEach(() => signInAs(sudo));

    it('reports an unknown account', async () => {
        await expect(updateUser('missing', userForm())).rejects.toThrow(
            EERROR_MESSAGE.USER_NOT_FOUND
        );
        await expect(deleteUser('missing')).rejects.toThrow(
            EERROR_MESSAGE.USER_NOT_FOUND
        );
    });

    it('reports validation errors from the DTO', async () => {
        await expect(
            createUser(userForm({ email: 'not-an-email' }))
        ).rejects.toThrow(EERROR_MESSAGE.USER_EMAIL_INVALID);
    });

    it('requires a password when creating an account', async () => {
        await expect(createUser(userForm({ password: '' }))).rejects.toThrow(
            'Le mot de passe est obligatoire à la création.'
        );
    });

    it('ignores fields the form does not declare, such as id', async () => {
        await createUser({ ...userForm(), id: 'chosen-id' } as IUserDto);

        expect(await findAccount('chosen-id')).toBeNull();
        expect(await prisma.user.count()).toBe(4);
    });
});
