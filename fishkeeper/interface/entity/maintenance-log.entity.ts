import { EMaintenanceType } from '@/constants/enum/maintenance-type.enum';

export interface IMaintenanceLog {
    id: string;
    type: EMaintenanceType;
    performedAt: Date;
    waterVolume: number | null;
    waterPercent: number | null;
    notes: string | null;
    aquariumId: string;
    taskId: string | null;
}