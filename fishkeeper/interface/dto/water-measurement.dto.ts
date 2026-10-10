import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class IWaterMeasurementDto {
    @IsString() aquariumId!: string;
    @IsDateString() @IsOptional() measuredAt?: string;
    @IsNumber() @Min(0) @IsOptional() temperature?: number;
    @IsNumber() @Min(0) @IsOptional() ph?: number;
    @IsNumber() @Min(0) @IsOptional() no2?: number;
    @IsNumber() @Min(0) @IsOptional() no3?: number;
    @IsNumber() @Min(0) @IsOptional() nh4?: number;
    @IsNumber() @Min(0) @IsOptional() gh?: number;
    @IsNumber() @Min(0) @IsOptional() kh?: number;
    @IsString() @IsOptional() notes?: string;
}