import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EWaterType } from '@/constants/enum/water-type.enum';

export class IAquariumDto {
    @IsString() @IsNotEmpty() name!: string;
    @IsNumber() @Min(0) grossVolume!: number;
    @IsNumber() @Min(0) netVolume!: number;
    @IsEnum(EWaterType) @IsOptional() waterType?: EWaterType;
    @IsString() @IsOptional() biotope?: string;
    @IsDateString() @IsOptional() startedAt?: string;
    @IsString() @IsOptional() dimension?: string;
    @IsString() @IsNotEmpty() ownerId!: string;
}