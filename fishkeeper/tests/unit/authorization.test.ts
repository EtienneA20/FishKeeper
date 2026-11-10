import { describe, expect, it } from 'vitest';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EROLE } from '@/constants/enum/role.enum';
import {
    assertCanManageRole,
    assertCanManageUsers,
    canDeleteUser,
    canEditUser,
    canManageRole,
    canManageUsers,
    getAssignableRoles,
    getManageableRoles,
} from '@/lib/auth/authorization';

const { USER, ADMIN, SUDO } = EROLE;

describe('user management access', () => {
    it.each([ADMIN, SUDO])('%s can manage user accounts', (role) => {
        expect(canManageUsers(role)).toBe(true);
        expect(() => assertCanManageUsers(role)).not.toThrow();
    });

    it.each([USER, undefined, null, 'OWNER' as EROLE])(
        '%s cannot manage user accounts',
        (role) => {
            expect(canManageUsers(role)).toBe(false);
            expect(() => assertCanManageUsers(role)).toThrow(
                EERROR_MESSAGE.USER_MANAGEMENT_FORBIDDEN
            );
        }
    );
});

describe('role hierarchy', () => {
    it.each([
        [USER, []],
        [ADMIN, [USER]],
        [SUDO, [USER, ADMIN, SUDO]],
        [null, []],
    ])('%s manages %j', (role, roles) => {
        expect(getManageableRoles(role)).toEqual(roles);
    });

    // actor → target → allowed
    it.each([
        [USER, USER, false],
        [USER, ADMIN, false],
        [USER, SUDO, false],
        [ADMIN, USER, true],
        [ADMIN, ADMIN, false],
        [ADMIN, SUDO, false],
        [SUDO, USER, true],
        [SUDO, ADMIN, true],
        [SUDO, SUDO, true],
    ])('%s managing a %s account: %s', (actor, target, allowed) => {
        expect(canManageRole(actor, target)).toBe(allowed);
        if (allowed) {
            expect(() => assertCanManageRole(actor, target)).not.toThrow();
        } else {
            expect(() => assertCanManageRole(actor, target)).toThrow(
                EERROR_MESSAGE.USER_ROLE_FORBIDDEN
            );
        }
    });

    it('refuses a missing target role', () => {
        expect(canManageRole(SUDO, undefined)).toBe(false);
    });
});

describe('per-account permissions', () => {
    const admin = { id: 'admin', role: ADMIN };
    const sudo = { id: 'sudo', role: SUDO };
    const user = { id: 'user', role: USER };
    const otherAdmin = { id: 'other-admin', role: ADMIN };

    it('lets ADMIN edit and delete USER accounts only', () => {
        expect(canEditUser(admin, user)).toBe(true);
        expect(canDeleteUser(admin, user)).toBe(true);
        expect(canEditUser(admin, otherAdmin)).toBe(false);
        expect(canDeleteUser(admin, sudo)).toBe(false);
    });

    it('lets SUDO edit and delete ADMIN accounts', () => {
        expect(canEditUser(sudo, admin)).toBe(true);
        expect(canDeleteUser(sudo, admin)).toBe(true);
    });

    it.each([admin, sudo])(
        'lets $role edit their own profile but never delete it',
        (actor) => {
            expect(canEditUser(actor, actor)).toBe(true);
            expect(canDeleteUser(actor, actor)).toBe(false);
        }
    );

    it('never lets a USER edit, even their own account', () => {
        expect(canEditUser(user, user)).toBe(false);
    });

    it('locks the role select on your own account', () => {
        expect(getAssignableRoles(admin, admin)).toEqual([ADMIN]);
        expect(getAssignableRoles(sudo, sudo)).toEqual([SUDO]);
    });

    it('offers only the manageable roles when creating or editing someone else', () => {
        expect(getAssignableRoles(admin, null)).toEqual([USER]);
        expect(getAssignableRoles(sudo, null)).toEqual([USER, ADMIN, SUDO]);
        expect(getAssignableRoles(sudo, admin)).toEqual([USER, ADMIN, SUDO]);
    });
});
