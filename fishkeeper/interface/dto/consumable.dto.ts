import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EConsumableType } from '@/constants/enum/consumable-type.enum';

export class IConsumableDto {
    @IsString() name!: string;
    @IsEnum(EConsumableType) type!: EConsumableType;
    @IsString() @IsOptional() brand?: string;
    @IsNumber() @Min(0) @IsOptional() quantity?: number;
    @IsString() @IsOptional() unit?: string;
    @IsDateString() @IsOptional() purchasedAt?: string;
    @IsDateString() @IsOptional() expiresAt?: string;
    @IsString() @IsOptional() notes?: string;
    @IsString() @IsOptional() imageURL?: string;
    @IsString() aquariumId!: string;
}