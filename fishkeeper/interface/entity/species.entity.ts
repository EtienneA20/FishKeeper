import { EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';

export interface ISpecies {
    id: string;
    name: string;
    scientificName: string | null;
    categoryId: string;
    description: string | null;
    imageURL: string | null;
    waterType: EWaterType | null;
    minTemperature: number | null;
    maxTemperature: number | null;
    minPh: number | null;
    maxPh: number | null;
    minGh: number | null;
    maxGh: number | null;
    minKh: number | null;
    maxKh: number | null;
    minVolume: number | null;
    aggressiveness: EAggressiveness | null;
}