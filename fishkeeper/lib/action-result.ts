/**
 * Résultat d'une server action de mutation.
 *
 * En production, Next.js masque le message des erreurs levées dans une server action :
 * les erreurs métier sont donc renvoyées comme valeur (cf. doc Next « Error Handling »).
 */
export type ActionResult = { ok: true } | { ok: false; error: string };

/** Erreur métier dont le message peut être affiché à l'utilisateur. */
export class ActionError extends Error {}

const GENERIC_ERROR = 'Une erreur est survenue.';

/** Violation d'une contrainte d'unicité Prisma (code P2002). */
function isUniqueViolation(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: unknown }).code === 'P2002'
    );
}

interface RunActionOptions {
    /** Message renvoyé si l'écriture viole une contrainte d'unicité. */
    uniqueViolation?: string;
}

/**
 * Exécute une mutation et convertit les erreurs attendues en `ActionResult`.
 * Les erreurs inattendues sont journalisées et remplacées par un message générique.
 */
export async function runAction(
    action: () => Promise<void>,
    { uniqueViolation }: RunActionOptions = {}
): Promise<ActionResult> {
    try {
        await action();
        return { ok: true };
    } catch (error) {
        if (error instanceof ActionError) {
            return { ok: false, error: error.message };
        }
        if (uniqueViolation && isUniqueViolation(error)) {
            return { ok: false, error: uniqueViolation };
        }
        console.error(error);
        return { ok: false, error: GENERIC_ERROR };
    }
}

/** Côté client : transforme un échec en exception, pour les dialogues qui l'affichent. */
export function unwrapActionResult(result: ActionResult): void {
    if (!result.ok) {
        throw new Error(result.error);
    }
}
