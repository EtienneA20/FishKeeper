'use client';

import React from 'react';
import ControlPointTwoToneIcon from '@mui/icons-material/ControlPointTwoTone';
import PageHeaderCard from '../../components/PageHeaderCard';
import DialogButton from '../../components/DialogButton';
import StatusChip from '../../components/StatusChip';
import { IEquipment } from '@/interface/entity/equipment.entity';
import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';

interface MaterialHeaderCardProps {
    equipments: IEquipment[];
}

export default function MaterialHeaderCard({
    equipments,
}: MaterialHeaderCardProps): React.JSX.Element {
    let nbOperationalEquipment = 0;
    
    for (const equipment of equipments) {
        if (equipment.status === EEquipmentStatus.WORKING) {
            nbOperationalEquipment += 1;
        }
    }

    return (
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
                onClick={() => {}}
            />
        }
    />
    );
}