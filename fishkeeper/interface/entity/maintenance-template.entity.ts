import { EFrequency } from '@/constants/enum/frequency.enum';
import { EMaintenanceType } from '@/constants/enum/maintenance-type.enum';

export interface IMaintenanceTemplate {
    id: string;
    title: string;
    type: EMaintenanceType;
    frequency: EFrequency;
    interval: number;
    waterPercent: number | null;
    description: string | null;
}