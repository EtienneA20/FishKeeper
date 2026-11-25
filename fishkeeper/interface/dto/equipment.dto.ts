import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';
import { EEquipmentType } from '@/constants/enum/equipment-type.enum';

export class IEquipmentDto {
    @IsString() name!: string;
    @IsEnum(EEquipmentType) type!: EEquipmentType;
    @IsString() @IsOptional() brand?: string;
    @IsString() @IsOptional() model?: string;
    @IsEnum(EEquipmentStatus) @IsOptional() status?: EEquipmentStatus;
    @IsDateString() @IsOptional() purchasedAt?: string;
    @IsNumber() @Min(1) @IsOptional() maintenanceInterval?: number;
    @IsDateString() @IsOptional() lastMaintainedAt?: string;
    @IsString() @IsOptional() notes?: string;
    @IsString() @IsOptional() imageURL?: string;
    @IsString() aquariumId!: string;
}