import { EAlertDirection } from '@/constants/enum/alert-direction.enum';
import { EAlertSeverity } from '@/constants/enum/alert-severity.enum';
import { EWaterParameter } from '@/constants/enum/water-parameter.enum';

export interface IAlert {
    id: string;
    parameter: EWaterParameter;
    value: number;
    targetLimit: number;
    direction: EAlertDirection;
    severity: EAlertSeverity;
    triggeredAt: Date;
    resolved: boolean;
    resolvedAt: Date | null;
    aquariumId: string;
    measurementId: number | null;
    targetRangeId: string | null;
}