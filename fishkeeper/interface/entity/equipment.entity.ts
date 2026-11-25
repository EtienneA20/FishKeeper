import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';
import { EEquipmentType } from '@/constants/enum/equipment-type.enum';

export interface IEquipment {
    id: string;
    name: string;
    type: EEquipmentType;
    brand: string | null;
    model: string | null;
    status: EEquipmentStatus;
    purchasedAt: Date | null;
    maintenanceInterval: number | null;
    lastMaintainedAt: Date | null;
    notes: string | null;
    imageURL: string | null;
    aquariumId: string;
}