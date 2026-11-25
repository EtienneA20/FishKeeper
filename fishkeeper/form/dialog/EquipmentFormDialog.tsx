'use client';

import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useMemo, useState } from 'react';

import type { IAquarium } from '@/interface/entity/aquarium.entity';
import type { IEquipment } from '@/interface/entity/equipment.entity';
import EquipmentForm from '../form/EquipmentForm';
import type { EquipmentFormValues } from '../schema/equipment.schema';

interface EquipmentFormDialogProps {
    open: boolean;
    data?: IEquipment | null;
    aquariums: Pick<IAquarium, 'id' | 'name'>[];
    isLoading?: boolean;
    onClose: () => void;
    onSave: (values: EquipmentFormValues, data: IEquipment | null) => void | Promise<void>;
}

function toDateInputValue(date: Date | null): string {
    return date ? new Date(date).toISOString().slice(0, 10) : '';
}

export default function EquipmentFormDialog({
    open,
    data = null,
    aquariums,
    isLoading = false,
    onClose,
    onSave,
}: EquipmentFormDialogProps): React.JSX.Element {
    const [error, setError] = useState<string | null>(null);

    const initialValues = useMemo<Partial<EquipmentFormValues>>(
        () =>
            data
                ? {
                      aquariumId: data.aquariumId,
                      name: data.name,
                      type: data.type,
                      brand: data.brand ?? '',
                      model: data.model ?? '',
                      status: data.status,
                      purchasedAt: toDateInputValue(data.purchasedAt),
                      maintenanceInterval: data.maintenanceInterval ?? undefined,
                      notes: data.notes ?? '',
                      imageURL: data.imageURL ?? '',
                  }
                : {},
        [data],
    );

    const handleClose = (): void => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (values: EquipmentFormValues): Promise<void> => {
        setError(null);
        try {
            await onSave(values, data);
            handleClose();
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : handleClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: 'card.background',
                        border: '1px solid',
                        borderColor: 'card.borderColor',
                        borderRadius: 4,
                    },
                },
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5em', fontWeight: 700, pb: 1.5 }}>
                {data ? 'Modifier un équipement' : 'Ajouter un équipement'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <EquipmentForm
                    initialValues={initialValues}
                    aquariumOptions={aquariums}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    submitLabel={data ? 'Modifier' : 'Ajouter'}
                />
            </DialogContent>
        </Dialog>
    );
}
