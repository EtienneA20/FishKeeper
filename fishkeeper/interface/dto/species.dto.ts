import { ArrayNotEmpty, IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';

export class ISpeciesDto {
    @IsString() name!: string;
    @IsString() @IsOptional() scientificName?: string;
    @IsArray() @ArrayNotEmpty() @IsUUID('all', { each: true }) categoryIds!: string[];
    @IsString() @IsOptional() description?: string;
    @IsString() @IsOptional() imageURL?: string;
    @IsEnum(EWaterType) @IsOptional() waterType?: EWaterType;
    @IsNumber() @Min(0) @IsOptional() minTemperature?: number;
    @IsNumber() @Min(0) @IsOptional() maxTemperature?: number;
    @IsNumber() @Min(0) @IsOptional() minPh?: number;
    @IsNumber() @Min(0) @IsOptional() maxPh?: number;
    @IsNumber() @Min(0) @IsOptional() minGh?: number;
    @IsNumber() @Min(0) @IsOptional() maxGh?: number;
    @IsNumber() @Min(0) @IsOptional() minKh?: number;
    @IsNumber() @Min(0) @IsOptional() maxKh?: number;
    @IsNumber() @Min(0) @IsOptional() minVolume?: number;
    @IsEnum(EAggressiveness) @IsOptional() aggressiveness?: EAggressiveness;
}