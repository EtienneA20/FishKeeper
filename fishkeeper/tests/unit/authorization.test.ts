import { describe, expect, it } from 'vitest';

import {
    canManageData,
    canManageUser,
    EROLE,
    getAssignableRoles,
} from '@/constants/enum/role.enum';

const { USER, ADMIN, SUDO } = EROLE;

describe('data management access (/data)', () => {
    it.each([
        [ADMIN, true],
        [SUDO, true],
        [USER, false],
        [null, false],
        [undefined, false],
    ])('%s: %s', (role, allowed) => {
        expect(canManageData(role)).toBe(allowed);
    });
});

describe('canManageUser (edit / delete from /data/user)', () => {
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
        [null, USER, false],
        [undefined, USER, false],
    ])('%s managing a %s account: %s', (actor, target, allowed) => {
        expect(canManageUser(actor, target)).toBe(allowed);
    });
});

describe('getAssignableRoles (role select of the user form)', () => {
    it.each([
        [USER, []],
        [ADMIN, [USER]],
        [SUDO, [ADMIN, USER, SUDO]],
        [null, []],
        [undefined, []],
    ])('%s can assign %j', (role, roles) => {
        expect(getAssignableRoles(role)).toEqual(roles);
    });

    it('only a SUDO can give the ADMIN or SUDO role', () => {
        for (const role of [USER, ADMIN]) {
            expect(getAssignableRoles(role)).not.toContain(ADMIN);
            expect(getAssignableRoles(role)).not.toContain(SUDO);
        }
        expect(getAssignableRoles(SUDO)).toContain(ADMIN);
    });
});
