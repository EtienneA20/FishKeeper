import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { EROLE, canManageData } from '@/constants/enum/role.enum';

/**
 * Vérifie qu'un utilisateur est connecté et, si des rôles sont fournis,
 * qu'il possède l'un d'eux. À appeler en tête de chaque server action.
 */
export async function requireRole(...roles: readonly EROLE[]): Promise<Session> {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
    }

    if (roles.length > 0 && !roles.includes(session.user.role)) {
        throw new Error("Vous n'avez pas les droits pour effectuer cette action.");
    }

    return session;
}

/**
 * Garde pour les pages de /data : redirige vers /login si non connecté,
 * vers / si le rôle ne permet pas la gestion des données.
 * À appeler dans chaque page (un layout ne se ré-exécute pas à la navigation).
 */
export async function requireDataAdminPage(): Promise<Session> {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/login');
    }

    if (!canManageData(session.user.role)) {
        redirect('/');
    }

    return session;
}
