import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { EERROR_MESSAGE } from '@/constants/enum/error-message.enum';

export class ISpeciesCategoryDto {
    @IsString({ message: EERROR_MESSAGE.CATEGORY_NAME_REQUIRED })
    @IsNotEmpty({ message: EERROR_MESSAGE.CATEGORY_NAME_REQUIRED })
    @MinLength(2, { message: EERROR_MESSAGE.CATEGORY_NAME_TOO_SHORT })
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true, message: EERROR_MESSAGE.CATEGORY_INCOMPATIBLE_INVALID })
    incompatibleWithIds?: string[];
}
