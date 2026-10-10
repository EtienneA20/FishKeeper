import { IsOptional, IsString } from 'class-validator';

export class ISpeciesCategoryDto {
    @IsString() name!: string;
    @IsString() @IsOptional() description?: string;
}