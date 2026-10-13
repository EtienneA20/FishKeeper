import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EMaintenanceType } from '@/constants/enum/maintenance-type.enum';

export class IMaintenanceLogDto {
    @IsEnum(EMaintenanceType) type!: EMaintenanceType;
    @IsDateString() @IsOptional() performedAt?: string;
    @IsNumber() @Min(0) @IsOptional() waterVolume?: number;
    @IsNumber() @Min(0) @IsOptional() waterPercent?: number;
    @IsString() @IsOptional() notes?: string;
    @IsString() aquariumId!: string;
    @IsString() @IsOptional() taskId?: string;
}