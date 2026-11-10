export enum EROLE {
    ADMIN = 'ADMIN',
    USER = 'USER',
    SUDO = 'SUDO',
}

export enum EROLE_LABEL {
    ADMIN = 'Administrateur',
    USER = 'Utilisateur',
    SUDO = 'Super Utilisateur',
}

export const ROLE_LABELS = [
    EROLE_LABEL.ADMIN,
    EROLE_LABEL.USER,
    EROLE_LABEL.SUDO,
];

/** Rôles autorisés à accéder à la gestion des données (/data). */
export const DATA_ADMIN_ROLES: readonly EROLE[] = [EROLE.ADMIN, EROLE.SUDO];

/** Rôles que seul un SUDO peut attribuer. */
export const PRIVILEGED_ROLES: readonly EROLE[] = [EROLE.ADMIN, EROLE.SUDO];

export function canManageData(role?: EROLE | null): boolean {
    return role != null && DATA_ADMIN_ROLES.includes(role);
}
