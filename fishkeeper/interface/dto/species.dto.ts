import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';
import {
    SPECIES_LIMITS,
    TEXT_LIMITS,
    type NumberLimit,
} from '@/constants/form-limits';

const NUMBER = { message: EERROR_MESSAGE.SPECIES_NUMBER_INVALID };
const TOO_LONG = { message: EERROR_MESSAGE.TEXT_TOO_LONG };
const URL_OPTIONS = { protocols: ['http', 'https'], require_protocol: true };

/** Nombre facultatif, borné, avec un nombre maximal de décimales (NaN et Infinity refusés). */
function BoundedNumber({ min, max, decimals }: NumberLimit): PropertyDecorator {
    return (target, key) => {
        IsOptional()(target, key);
        IsNumber({ maxDecimalPlaces: decimals }, NUMBER)(target, key);
        Min(min, NUMBER)(target, key);
        Max(max, NUMBER)(target, key);
    };
}

export class ISpeciesDto {
    @IsString({ message: EERROR_MESSAGE.SPECIES_NAME_REQUIRED })
    @IsNotEmpty({ message: EERROR_MESSAGE.SPECIES_NAME_REQUIRED })
    @MinLength(2, { message: EERROR_MESSAGE.SPECIES_NAME_TOO_SHORT })
    @MaxLength(TEXT_LIMITS.name, TOO_LONG)
    name!: string;

    @IsString()
    @IsOptional()
    @MaxLength(TEXT_LIMITS.scientificName, TOO_LONG)
    scientificName?: string;

    @IsArray({ message: EERROR_MESSAGE.SPECIES_CATEGORY_REQUIRED })
    @ArrayNotEmpty({ message: EERROR_MESSAGE.SPECIES_CATEGORY_REQUIRED })
    @IsUUID('all', {
        each: true,
        message: EERROR_MESSAGE.SPECIES_CATEGORY_INVALID,
    })
    categoryIds!: string[];

    @IsString()
    @IsOptional()
    @MaxLength(TEXT_LIMITS.description, TOO_LONG)
    description?: string;

    @IsOptional()
    @MaxLength(TEXT_LIMITS.url, TOO_LONG)
    @IsUrl(URL_OPTIONS, { message: EERROR_MESSAGE.IMAGE_URL_INVALID })
    imageURL?: string;

    @IsEnum(EWaterType, { message: EERROR_MESSAGE.SPECIES_WATER_TYPE_INVALID })
    @IsOptional()
    waterType?: EWaterType;

    @BoundedNumber(SPECIES_LIMITS.temperature) minTemperature?: number;
    @BoundedNumber(SPECIES_LIMITS.temperature) maxTemperature?: number;
    @BoundedNumber(SPECIES_LIMITS.ph) minPh?: number;
    @BoundedNumber(SPECIES_LIMITS.ph) maxPh?: number;
    @BoundedNumber(SPECIES_LIMITS.gh) minGh?: number;
    @BoundedNumber(SPECIES_LIMITS.gh) maxGh?: number;
    @BoundedNumber(SPECIES_LIMITS.kh) minKh?: number;
    @BoundedNumber(SPECIES_LIMITS.kh) maxKh?: number;
    @BoundedNumber(SPECIES_LIMITS.volume) minVolume?: number;

    @IsEnum(EAggressiveness, {
        message: EERROR_MESSAGE.SPECIES_AGGRESSIVENESS_INVALID,
    })
    @IsOptional()
    aggressiveness?: EAggressiveness;
}
