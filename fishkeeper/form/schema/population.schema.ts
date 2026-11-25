import * as yup from 'yup';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import {
    POPULATION_LIMITS,
    POPULATION_MIN_DATE,
    TEXT_LIMITS,
} from '@/constants/form-limits';
import {
    optionalBoundedNumber,
    optionalText,
    optionalUrl,
} from './common.schema';

export interface PopulationFormValues {
    name?: string;
    /** Format AAAA-MM-JJ (champ date HTML). */
    introducedAt: string;
    notes?: string;
    size?: number;
    weight?: number;
    imageURL?: string;
    aquariumId: string;
    speciesId: string;
}

/** Date du jour (fuseau local) au format AAAA-MM-JJ attendu par un champ date. */
export function todayAsInputValue(): string {
    const now = new Date();
    const pad = (value: number): string => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const populationSchema: yup.ObjectSchema<PopulationFormValues> =
    yup.object({
        name: optionalText(TEXT_LIMITS.name),
        introducedAt: yup
            .string()
            .required("La date d'introduction est obligatoire.")
            .matches(
                /^\d{4}-\d{2}-\d{2}$/,
                EERROR_MESSAGE.POPULATION_DATE_INVALID
            )
            .test(
                'date-valid',
                EERROR_MESSAGE.POPULATION_DATE_INVALID,
                (value) => !Number.isNaN(new Date(value).getTime())
            )
            // Les chaînes AAAA-MM-JJ se comparent correctement dans l'ordre alphabétique.
            .test(
                'date-range',
                EERROR_MESSAGE.POPULATION_DATE_OUT_OF_RANGE,
                (value) =>
                    value >= POPULATION_MIN_DATE && value <= todayAsInputValue()
            ),
        notes: optionalText(TEXT_LIMITS.notes),
        size: optionalBoundedNumber(POPULATION_LIMITS.size),
        weight: optionalBoundedNumber(POPULATION_LIMITS.weight),
        imageURL: optionalUrl(TEXT_LIMITS.url),
        aquariumId: yup
            .string()
            .required(EERROR_MESSAGE.POPULATION_AQUARIUM_REQUIRED),
        speciesId: yup
            .string()
            .required(EERROR_MESSAGE.POPULATION_SPECIES_REQUIRED),
    });
