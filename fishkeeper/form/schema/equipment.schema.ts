import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';
import { EEquipmentType } from '@/constants/enum/equipment-type.enum';
import * as yup from 'yup';

export interface EquipmentFormValues {
    aquariumId: string;
    name: string;
    type: EEquipmentType;
    brand?: string;
    model?: string;
    status: EEquipmentStatus;
    purchasedAt?: string;
    maintenanceInterval?: number;
    notes?: string;
    imageURL?: string;
}

export const equipmentSchema: yup.ObjectSchema<EquipmentFormValues> = yup.object({
    aquariumId: yup.string().required("L'aquarium est obligatoire."),
    name: yup
        .string()
        .trim()
        .required('Le nom est obligatoire.')
        .min(2, 'Le nom doit contenir au moins 2 caractères.'),
    type: yup
        .mixed<EEquipmentType>()
        .oneOf(Object.values(EEquipmentType), 'Le type est invalide.')
        .required('Le type est obligatoire.'),
    brand: yup.string().trim().optional(),
    model: yup.string().trim().optional(),
    status: yup
        .mixed<EEquipmentStatus>()
        .oneOf(Object.values(EEquipmentStatus), 'Le statut est invalide.')
        .required('Le statut est obligatoire.'),
    purchasedAt: yup
        .string()
        .test(
            'not-in-future',
            "La date d'achat ne peut pas être dans le futur.",
            (value) => !value || new Date(value) <= new Date(),
        )
        .optional(),
    maintenanceInterval: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .typeError("L'intervalle doit être un nombre.")
        .integer("L'intervalle doit être un nombre entier de jours.")
        .min(1, "L'intervalle doit être d'au moins 1 jour.")
        .optional(),
    notes: yup.string().trim().optional(),
    imageURL: yup
        .string()
        .trim()
        .transform((value) => (value === '' ? undefined : value))
        .url("L'URL de l'image est invalide.")
        .optional(),
});
