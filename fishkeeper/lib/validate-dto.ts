import { validate } from 'class-validator';

import { ActionError } from '@/lib/action-result';

/** Chaîne vide ou composée d'espaces → `undefined` ; sinon la chaîne sans espaces autour. */
export function emptyToUndefined(
    value: string | undefined
): string | undefined {
    return value?.trim() || undefined;
}

/**
 * Valide un DTO class-validator et lève une `ActionError` regroupant les messages
 * (sans doublons), ou `fallback` si aucune contrainte ne fournit de message.
 */
export async function assertValidDto(
    dto: object,
    fallback: string
): Promise<void> {
    const errors = await validate(dto, { whitelist: true });
    if (errors.length === 0) return;

    const messages = errors.flatMap((error) =>
        Object.values(error.constraints ?? {})
    );
    throw new ActionError([...new Set(messages)].join(' ') || fallback);
}
