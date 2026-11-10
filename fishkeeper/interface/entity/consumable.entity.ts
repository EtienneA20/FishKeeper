import { EConsumableType } from '@/constants/enum/consumable-type.enum';

export interface IConsumable {
    id: string;
    name: string;
    type: EConsumableType;
    brand: string | null;
    quantity: number | null;
    unit: string | null;
    purchasedAt: Date | null;
    expiresAt: Date | null;
    notes: string | null;
    imageURL: string | null;
    createdAt: Date;
    aquariumId: string;
}