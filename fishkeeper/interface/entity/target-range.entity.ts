import { EWaterParameter } from '@/constants/enum/water-parameter.enum';

export interface ITargetRange {
    id: string;
    parameter: EWaterParameter;
    warningMin: number | null;
    warningMax: number | null;
    dangerMin: number;
    dangerMax: number;
    isAutoCalculated: boolean;
    aquariumId: string;
}