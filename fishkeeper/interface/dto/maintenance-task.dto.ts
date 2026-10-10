import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EFrequency } from '@/constants/enum/frequency.enum';
import { EMaintenanceType } from '@/constants/enum/maintenance-type.enum';

export class IMaintenanceTaskDto {
    @IsString() title!: string;
    @IsEnum(EMaintenanceType) type!: EMaintenanceType;
    @IsEnum(EFrequency) frequency!: EFrequency;
    @IsNumber() @Min(1) @IsOptional() interval?: number;
    @IsDateString() nextDueAt!: string;
    @IsDateString() @IsOptional() lastDoneAt?: string;
    @IsBoolean() @IsOptional() isActive?: boolean;
    @IsString() aquariumId!: string;
}