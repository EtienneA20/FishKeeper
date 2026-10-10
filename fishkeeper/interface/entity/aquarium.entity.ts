import { EWaterType } from '@/constants/enum/water-type.enum';

export interface IAquarium {
    id: string;
    name: string;
    grossVolume: number;
    netVolume: number;
    waterType: EWaterType;
    biotope: string | null;
    startedAt: Date | null;
    dimension: string | null;
    createdAt: Date;
    ownerId: string;
}