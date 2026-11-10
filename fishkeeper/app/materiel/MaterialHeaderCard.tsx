'use client';

import React from 'react';
import ControlPointTwoToneIcon from '@mui/icons-material/ControlPointTwoTone';
import PageHeaderCard from '../../components/PageHeaderCard';
import DialogButton from '../../components/DialogButton';
import StatusChip from '../../components/StatusChip';

export default function MaterialHeaderCard(): React.JSX.Element {
    return (
    <PageHeaderCard
        title="Matériel & Équipements"
        description="Inventaire technique du bac, cycles et d'usure des consommables."
        statusSlot={
            <StatusChip
                label="Équipement opérationnels (5/6 en service)"
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