import * as yup from 'yup';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import type { NumberLimit } from '@/constants/form-limits';

function hasAtMostDecimals(value: number, decimals: number): boolean {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor === value;
}

/** Nombre facultatif borné : vide → `undefined`, `NaN` ou hors bornes → erreur. */
export const optionalBoundedNumber = ({ min, max, decimals }: NumberLimit) =>
    yup
        .number()
        .transform((value, originalValue) =>
            originalValue === '' || originalValue == null ? undefined : value
        )
        .typeError('Veuillez saisir un nombre valide.')
        .min(min, `La valeur doit être comprise entre ${min} et ${max}.`)
        .max(max, `La valeur doit être comprise entre ${min} et ${max}.`)
        .test(
            'decimals',
            decimals === 0
                ? 'Veuillez saisir un nombre entier.'
                : `${decimals} décimale${decimals > 1 ? 's' : ''} maximum.`,
            (value) => value == null || hasAtMostDecimals(value, decimals)
        )
        .optional();

/** Texte facultatif borné en longueur. */
export const optionalText = (maxLength: number) =>
    yup
        .string()
        .trim()
        .max(maxLength, `${maxLength} caractères maximum.`)
        .optional();

/** URL facultative (http/https uniquement), bornée en longueur. */
export const optionalUrl = (maxLength: number) =>
    yup
        .string()
        .trim()
        .transform((value) => (value === '' ? undefined : value))
        .max(maxLength, `${maxLength} caractères maximum.`)
        .url(EERROR_MESSAGE.IMAGE_URL_INVALID)
        .matches(/^https?:\/\//i, {
            message: "L'URL doit commencer par http:// ou https://.",
            excludeEmptyString: true,
        })
        .optional();
