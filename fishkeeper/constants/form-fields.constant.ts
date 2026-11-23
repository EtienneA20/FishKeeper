import type { FormField } from '@/components/GenericForm';
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_TYPES } from '@/constants/equipment.constant';
import { IAquarium } from '@/interface/entity/aquarium.entity';


// Les aquariums viennent de la BD : on les reçoit en paramètre pour remplir la liste déroulante.
export function getEquipmentFields(aquariums: Pick<IAquarium, 'id' | 'name'>[]): FormField[] {
    return [
        {
            name: 'aquariumId',
            label: 'Aquarium',
            type: 'text',
            options: aquariums.map((aquarium) => ({ value: aquarium.id, label: aquarium.name })),
        },
        { name: 'name', label: 'Nom', type: 'text' },
        {
            name: 'type',
            label: 'Type',
            type: 'text',
            options: Object.entries(EQUIPMENT_TYPES).map(([value, info]) => ({
                value,
                label: info.label,
            })),
        },
        { name: 'brand', label: 'Marque', type: 'text' },
        { name: 'model', label: 'Modèle', type: 'text' },
        {
            name: 'status',
            label: 'Statut',
            type: 'text',
            options: Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
            })),
        },
        { name: 'purchasedAt', label: "Date d'achat", type: 'date' },
        { name: 'maintenanceInterval', label: 'Intervalle de maintenance (jours)', type: 'number' },
        { name: 'notes', label: 'Notes', type: 'text' },
        { name: 'imageURL', label: "URL de l'image", type: 'url' },
    ];
}
