'use client';

import React from 'react';
import GenericForm from '../../components/GenericForm';
import { createEquipment } from '@/actions/equipment.controller';
import { IAquarium } from '@/interface/entity/aquarium.entity';
import { getEquipmentFields } from '@/constants/form-fields.constant';

interface AddEquipmentDialogProps {
    open: boolean;
    onClose: () => void;
    aquariums: Pick<IAquarium, 'id' | 'name'>[];
}

export default function AddEquipmentDialog({
    open,
    onClose,
    aquariums,
}: AddEquipmentDialogProps): React.JSX.Element {
    return (
        <GenericForm
            title="Ajouter un équipement"
            open={open}
            onClose={onClose}
            fields={getEquipmentFields(aquariums)}
            onSubmit={createEquipment}
            submitLabel="Ajouter"
        />
    );
}
