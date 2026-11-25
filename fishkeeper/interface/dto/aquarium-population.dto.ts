import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';
import { POPULATION_LIMITS, TEXT_LIMITS } from '@/constants/form-limits';

const NUMBER = { message: EERROR_MESSAGE.POPULATION_NUMBER_INVALID };
const TOO_LONG = { message: EERROR_MESSAGE.TEXT_TOO_LONG };
const { size, weight } = POPULATION_LIMITS;

export class IAquariumPopulationDto {
    @IsString()
    @IsOptional()
    @MaxLength(TEXT_LIMITS.name, TOO_LONG)
    name?: string;

    @IsDateString(
        { strict: true },
        { message: EERROR_MESSAGE.POPULATION_DATE_INVALID }
    )
    @IsOptional()
    introducedAt?: string;

    @IsString()
    @IsOptional()
    @MaxLength(TEXT_LIMITS.notes, TOO_LONG)
    notes?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: size.decimals }, NUMBER)
    @Min(size.min, NUMBER)
    @Max(size.max, NUMBER)
    size?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: weight.decimals }, NUMBER)
    @Min(weight.min, NUMBER)
    @Max(weight.max, NUMBER)
    weight?: number;

    @IsOptional()
    @MaxLength(TEXT_LIMITS.url, TOO_LONG)
    @IsUrl(
        { protocols: ['http', 'https'], require_protocol: true },
        { message: EERROR_MESSAGE.IMAGE_URL_INVALID }
    )
    imageURL?: string;

    @IsString({ message: EERROR_MESSAGE.POPULATION_AQUARIUM_REQUIRED })
    @IsNotEmpty({ message: EERROR_MESSAGE.POPULATION_AQUARIUM_REQUIRED })
    aquariumId!: string;

    @IsString({ message: EERROR_MESSAGE.POPULATION_SPECIES_REQUIRED })
    @IsNotEmpty({ message: EERROR_MESSAGE.POPULATION_SPECIES_REQUIRED })
    speciesId!: string;
}
