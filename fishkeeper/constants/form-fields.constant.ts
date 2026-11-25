import type { FormField } from '@/components/GenericForm';
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_TYPES } from '@/constants/equipment.constant';
import { IAquarium } from '@/interface/entity/aquarium.entity';


export function getEquipmentFields(aquariums: Pick<IAquarium, 'id' | 'name'>[]): FormField[] {
    return [
        {
            name: 'aquariumId',
            label: 'Aquarium',
            type: 'text',
            required: true,
            options: aquariums.map((aquarium) => ({ value: aquarium.id, label: aquarium.name })),
        },
        { name: 'name', label: 'Nom', type: 'text', required: true },
        {
            name: 'type',
            label: 'Type',
            type: 'text',
            required: true,
            defaultValueList: '',
            options: Object.entries(EQUIPMENT_TYPES).map(([value, info]) => ({
                value,
                label: info.label,
            })),
        },
        { name: 'brand', label: 'Marque', type: 'text', required: true },
        { name: 'model', label: 'Modèle', type: 'text', required: true },
        {
            name: 'status',
            label: 'Statut',
            type: 'text',
            required: true,
            options: Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
            })),
        },
        { name: 'purchasedAt', label: "Date d'achat", type: 'date', required: true },
        { name: 'maintenanceInterval', label: 'Intervalle de maintenance (jours)', type: 'number', required: true },
        { name: 'notes', label: 'Notes', type: 'text' },
        { name: 'imageURL', label: "URL de l'image", type: 'url' },
    ];
}
