import * as yup from 'yup';

import { POPULATION_LIMITS, POPULATION_MIN_DATE, TEXT_LIMITS } from '@/constants/form-limits';
import { optionalBoundedNumber, optionalText, optionalUrl } from './number.schema';

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

export const populationSchema: yup.ObjectSchema<PopulationFormValues> = yup.object({
    name: optionalText(TEXT_LIMITS.name),
    introducedAt: yup
        .string()
        .required("La date d'introduction est obligatoire.")
        .matches(/^\d{4}-\d{2}-\d{2}$/, "La date d'introduction est invalide.")
        .test(
            'date-valid',
            "La date d'introduction est invalide.",
            (value) => !Number.isNaN(new Date(value).getTime())
        )
        // Les chaînes AAAA-MM-JJ se comparent correctement dans l'ordre alphabétique.
        .test(
            'date-range',
            "La date d'introduction ne peut pas être dans le futur ni avant 1900.",
            (value) => value >= POPULATION_MIN_DATE && value <= todayAsInputValue()
        ),
    notes: optionalText(TEXT_LIMITS.notes),
    size: optionalBoundedNumber(POPULATION_LIMITS.size),
    weight: optionalBoundedNumber(POPULATION_LIMITS.weight),
    imageURL: optionalUrl(TEXT_LIMITS.url),
    aquariumId: yup.string().required("L'aquarium est obligatoire."),
    speciesId: yup.string().required("L'espèce est obligatoire."),
});
