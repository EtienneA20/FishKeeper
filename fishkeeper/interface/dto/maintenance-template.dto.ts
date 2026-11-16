import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EFrequency } from '@/constants/enum/frequency.enum';
import { EMaintenanceType } from '@/constants/enum/maintenance-type.enum';

export class IMaintenanceTemplateDto {
    @IsString() title!: string;
    @IsEnum(EMaintenanceType) type!: EMaintenanceType;
    @IsEnum(EFrequency) frequency!: EFrequency;
    @IsNumber() @Min(1) @IsOptional() interval?: number;
    @IsNumber() @Min(0) @IsOptional() waterPercent?: number;
    @IsString() @IsOptional() description?: string;
}