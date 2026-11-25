'use client';

import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';

import type {
    IAquariumPopulationDetails,
    IPopulationAquariumOption,
} from '@/interface/entity/aquarium-population.entity';
import { toCalendarDateInput } from '@/lib/format';
import PopulationForm from '../form/PopulationForm';
import type { PopulationFormValues } from '../schema/population.schema';

interface PopulationFormDialogProps {
    open: boolean;
    data?: IAquariumPopulationDetails | null;
    aquariumOptions: IPopulationAquariumOption[];
    isLoading?: boolean;
    onClose: () => void;
    onSave: (
        values: PopulationFormValues,
        data: IAquariumPopulationDetails | null
    ) => void | Promise<void>;
}

function toFormValues(data: IAquariumPopulationDetails): PopulationFormValues {
    return {
        name: data.name ?? '',
        introducedAt: toCalendarDateInput(data.introducedAt),
        notes: data.notes ?? '',
        size: data.size ?? undefined,
        weight: data.weight ?? undefined,
        imageURL: data.imageURL ?? '',
        aquariumId: data.aquariumId,
        speciesId: data.speciesId,
    };
}

export default function PopulationFormDialog({
    open,
    data = null,
    aquariumOptions,
    isLoading = false,
    onClose,
    onSave,
}: PopulationFormDialogProps): React.JSX.Element {
    const [error, setError] = useState<string | null>(null);

    const handleClose = (): void => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (
        values: PopulationFormValues
    ): Promise<void> => {
        setError(null);
        try {
            await onSave(values, data);
            handleClose();
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Une erreur est survenue.'
            );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : handleClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                {data ? 'Modifier un individu' : 'Créer un individu'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <PopulationForm
                    key={data?.id ?? 'new'}
                    initialValues={data ? toFormValues(data) : undefined}
                    initialSpecies={data?.species ?? null}
                    aquariumOptions={aquariumOptions}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    submitLabel={data ? 'Modifier' : 'Créer'}
                />
            </DialogContent>
        </Dialog>
    );
}
