'use client';

import React, { useState } from 'react';
import ControlPointTwoToneIcon from '@mui/icons-material/ControlPointTwoTone';
import PageHeaderCard from '../../components/PageHeaderCard';
import DialogButton from '../../components/DialogButton';
import StatusChip from '../../components/StatusChip';
import EquipmentFormDialog from '@/form/dialog/EquipmentFormDialog';
import type { EquipmentFormValues } from '@/form/schema/equipment.schema';
import { createEquipment } from '@/actions/equipment.controller';
import { IEquipment } from '@/interface/entity/equipment.entity';
import { IAquarium } from '@/interface/entity/aquarium.entity';
import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';

interface EquipmentHeaderCardProps {
    equipments: IEquipment[];
    aquariums: Pick<IAquarium, 'id' | 'name'>[];
}

export default function EquipmentHeaderCard({
    equipments,
    aquariums,
}: EquipmentHeaderCardProps): React.JSX.Element {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    let nbOperationalEquipment = 0;

    const handleSave = async (values: EquipmentFormValues): Promise<void> => {
        setIsSaving(true);
        try {
            await createEquipment(values);
        } finally {
            setIsSaving(false);
        }
    };
    
    for (const equipment of equipments) {
        if (equipment.status === EEquipmentStatus.WORKING) {
            nbOperationalEquipment += 1;
        }
    }

    return (
    <>
    <PageHeaderCard
        title="Matériel & Équipements"
        description="Inventaire technique, cycles d'entretien et usure des consommables."
        statusSlot={
            <StatusChip
                label={`Équipements opérationnels (${nbOperationalEquipment}/${equipments.length})`}
                color="#009d8d"
                backgroundColor="#e5f5f4"
            />
        }
        actionsSlot={
            <DialogButton
                startIcon={<ControlPointTwoToneIcon />}
                label="Ajouter un équipement"
                backgroundColor="darkBlueButton.background"
                textColor="darkBlueButton.colorText"
                onClick={() => setIsAddOpen(true)}
            />
        }
    />
        <EquipmentFormDialog
            open={isAddOpen}
            aquariums={aquariums}
            isLoading={isSaving}
            onClose={() => setIsAddOpen(false)}
            onSave={handleSave}
        />
    </>
    );
}