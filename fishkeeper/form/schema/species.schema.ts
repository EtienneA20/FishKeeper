import * as yup from 'yup';

import { EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';
import { SPECIES_LIMITS, TEXT_LIMITS, type NumberLimit } from '@/constants/form-limits';
import { optionalBoundedNumber, optionalText, optionalUrl } from './number.schema';

export interface SpeciesFormValues {
    name: string;
    scientificName?: string;
    categoryIds: string[];
    description?: string;
    imageURL?: string;
    waterType?: EWaterType;
    minTemperature?: number;
    maxTemperature?: number;
    minPh?: number;
    maxPh?: number;
    minGh?: number;
    maxGh?: number;
    minKh?: number;
    maxKh?: number;
    minVolume?: number;
    aggressiveness?: EAggressiveness;
}

/** Le maximum doit être supérieur ou égal au minimum quand les deux sont renseignés. */
const maxNumber = (limit: NumberLimit, minField: keyof SpeciesFormValues) =>
    optionalBoundedNumber(limit).test(
        'max-gte-min',
        'Le maximum doit être supérieur ou égal au minimum.',
        function (value) {
            const min = this.parent[minField] as number | undefined;
            return value == null || min == null || Number.isNaN(min) || value >= min;
        }
    );

const optionalEnum = <T extends string>(values: T[], message: string) =>
    yup
        .mixed<T>()
        .transform((value) => (value === '' ? undefined : value))
        .oneOf(values, message)
        .optional();

export const speciesSchema: yup.ObjectSchema<SpeciesFormValues> = yup.object({
    name: yup
        .string()
        .trim()
        .required("Le nom de l'espèce est obligatoire.")
        .min(2, "Le nom de l'espèce doit contenir au moins 2 caractères.")
        .max(TEXT_LIMITS.name, `${TEXT_LIMITS.name} caractères maximum.`),
    scientificName: optionalText(TEXT_LIMITS.scientificName),
    categoryIds: yup
        .array(yup.string().required())
        .min(1, 'Au moins une catégorie est obligatoire.')
        .required()
        .default([]),
    description: optionalText(TEXT_LIMITS.description),
    imageURL: optionalUrl(TEXT_LIMITS.url),
    waterType: optionalEnum(Object.values(EWaterType), "Le type d'eau est invalide."),
    minTemperature: optionalBoundedNumber(SPECIES_LIMITS.temperature),
    maxTemperature: maxNumber(SPECIES_LIMITS.temperature, 'minTemperature'),
    minPh: optionalBoundedNumber(SPECIES_LIMITS.ph),
    maxPh: maxNumber(SPECIES_LIMITS.ph, 'minPh'),
    minGh: optionalBoundedNumber(SPECIES_LIMITS.gh),
    maxGh: maxNumber(SPECIES_LIMITS.gh, 'minGh'),
    minKh: optionalBoundedNumber(SPECIES_LIMITS.kh),
    maxKh: maxNumber(SPECIES_LIMITS.kh, 'minKh'),
    minVolume: optionalBoundedNumber(SPECIES_LIMITS.volume),
    aggressiveness: optionalEnum(
        Object.values(EAggressiveness),
        "Le niveau d'agressivité est invalide."
    ),
});
