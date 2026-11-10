import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EWaterParameter } from '@/constants/enum/water-parameter.enum';

export class ITargetRangeDto {
    @IsEnum(EWaterParameter) parameter!: EWaterParameter;
    @IsNumber() @Min(0) @IsOptional() warningMin?: number;
    @IsNumber() @Min(0) @IsOptional() warningMax?: number;
    @IsNumber() @Min(0) dangerMin!: number;
    @IsNumber() @Min(0) dangerMax!: number;
    @IsBoolean() @IsOptional() isAutoCalculated?: boolean;
    @IsString() aquariumId!: string;
}