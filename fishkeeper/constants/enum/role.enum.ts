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