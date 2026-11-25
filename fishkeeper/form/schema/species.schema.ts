import * as yup from 'yup';

import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';
import {
    SPECIES_LIMITS,
    TEXT_LIMITS,
    type NumberLimit,
} from '@/constants/form-limits';
import {
    optionalBoundedNumber,
    optionalText,
    optionalUrl,
} from './common.schema';

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
            return (
                value == null ||
                min == null ||
                Number.isNaN(min) ||
                value >= min
            );
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
        .required(EERROR_MESSAGE.SPECIES_NAME_REQUIRED)
        .min(2, EERROR_MESSAGE.SPECIES_NAME_TOO_SHORT)
        .max(TEXT_LIMITS.name, `${TEXT_LIMITS.name} caractères maximum.`),
    scientificName: optionalText(TEXT_LIMITS.scientificName),
    categoryIds: yup
        .array(yup.string().required())
        .min(1, EERROR_MESSAGE.SPECIES_CATEGORY_REQUIRED)
        .required()
        .default([]),
    description: optionalText(TEXT_LIMITS.description),
    imageURL: optionalUrl(TEXT_LIMITS.url),
    waterType: optionalEnum(
        Object.values(EWaterType),
        EERROR_MESSAGE.SPECIES_WATER_TYPE_INVALID
    ),
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
        EERROR_MESSAGE.SPECIES_AGGRESSIVENESS_INVALID
    ),
});
