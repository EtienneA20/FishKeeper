import { Role } from '@/generated/prisma/enums';

export const EROLE = Role;
export type EROLE = Role;

export enum EROLE_LABEL {
    ADMIN = 'Administrateur',
    USER = 'Utilisateur',
    SUDO = 'Super Utilisateur',}

export const ROLE_LABELS = [
    EROLE_LABEL.ADMIN,
    EROLE_LABEL.USER,
    EROLE_LABEL.SUDO,
];