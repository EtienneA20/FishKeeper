import { EFrequency } from '@/constants/enum/frequency.enum';
import { EMaintenanceType } from '@/constants/enum/maintenance-type.enum';

export interface IMaintenanceTask {
    id: string;
    title: string;
    type: EMaintenanceType;
    frequency: EFrequency;
    interval: number;
    nextDueAt: Date;
    lastDoneAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    aquariumId: string;
}