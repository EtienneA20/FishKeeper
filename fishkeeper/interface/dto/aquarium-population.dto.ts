import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class IAquariumPopulationDto {
    @IsString() @IsOptional() name?: string;
    @IsDateString() @IsOptional() introducedAt?: string;
    @IsString() @IsOptional() notes?: string;
    @IsNumber() @Min(0) @IsOptional() size?: number;
    @IsNumber() @Min(0) @IsOptional() weight?: number;
    @IsString() @IsOptional() imageURL?: string;
    @IsString() aquariumId!: string;
    @IsString() speciesId!: string;
}