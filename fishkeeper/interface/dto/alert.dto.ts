import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EAlertDirection } from '@/constants/enum/alert-direction.enum';
import { EAlertSeverity } from '@/constants/enum/alert-severity.enum';
import { EWaterParameter } from '@/constants/enum/water-parameter.enum';

export class IAlertDto {
    @IsEnum(EWaterParameter) parameter!: EWaterParameter;
    @IsNumber() value!: number;
    @IsNumber() targetLimit!: number;
    @IsEnum(EAlertDirection) direction!: EAlertDirection;
    @IsEnum(EAlertSeverity) severity!: EAlertSeverity;
    @IsBoolean() @IsOptional() resolved?: boolean;
    @IsString() aquariumId!: string;
    @IsNumber() @IsOptional() measurementId?: number;
    @IsString() @IsOptional() targetRangeId?: string;
}