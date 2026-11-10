import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EROLE } from '@/constants/enum/role.enum';

type MaybeRole = EROLE | null | undefined;

export interface RoleHolder {
    id: string;
    role: EROLE;
}

/**
 * Roles each role may create, edit, assign and delete.
 * ADMIN manages regular users only; SUDO manages every account, ADMIN included.
 */
const MANAGEABLE_ROLES: Record<EROLE, readonly EROLE[]> = {
    [EROLE.USER]: [],
    [EROLE.ADMIN]: [EROLE.USER],
    [EROLE.SUDO]: [EROLE.USER, EROLE.ADMIN, EROLE.SUDO],
};

export function getManageableRoles(role: MaybeRole): readonly EROLE[] {
    return (role && MANAGEABLE_ROLES[role]) || [];
}

export function canManageUsers(role: MaybeRole): boolean {
    return getManageableRoles(role).length > 0;
}

export function canManageRole(
    actorRole: MaybeRole,
    targetRole: MaybeRole
): boolean {
    return !!targetRole && getManageableRoles(actorRole).includes(targetRole);
}

/** Everyone who can manage users may edit their own profile, but never their own role. */
export function canEditUser(actor: RoleHolder, target: RoleHolder): boolean {
    return actor.id === target.id
        ? canManageUsers(actor.role)
        : canManageRole(actor.role, target.role);
}

export function canDeleteUser(actor: RoleHolder, target: RoleHolder): boolean {
    return actor.id !== target.id && canManageRole(actor.role, target.role);
}

/** Roles that may be picked in the user form; `target` is null when creating an account. */
export function getAssignableRoles(
    actor: RoleHolder,
    target: RoleHolder | null
): readonly EROLE[] {
    if (target?.id === actor.id) {
        return [target.role];
    }
    return getManageableRoles(actor.role);
}

export function assertCanManageUsers(role: MaybeRole): void {
    if (!canManageUsers(role)) {
        throw new Error(EERROR_MESSAGE.USER_MANAGEMENT_FORBIDDEN);
    }
}

export function assertCanManageRole(
    actorRole: MaybeRole,
    targetRole: MaybeRole
): void {
    if (!canManageRole(actorRole, targetRole)) {
        throw new Error(EERROR_MESSAGE.USER_ROLE_FORBIDDEN);
    }
}
