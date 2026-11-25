'use client';

import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';

import type { ISpeciesCategory } from '@/interface/entity/species-category.entity';
import type { ISpeciesDetails } from '@/interface/entity/species.entity';
import SpeciesForm from '../form/SpeciesForm';
import type { SpeciesFormValues } from '../schema/species.schema';

interface SpeciesFormDialogProps {
    open: boolean;
    data?: ISpeciesDetails | null;
    /** Toutes les catégories, pour le choix des catégories de l'espèce. */
    categoryOptions: Pick<ISpeciesCategory, 'id' | 'name'>[];
    isLoading?: boolean;
    onClose: () => void;
    onSave: (values: SpeciesFormValues, data: ISpeciesDetails | null) => void | Promise<void>;
}

/** Les champs `null` de la base deviennent `undefined` (champ vide) dans le formulaire. */
function toFormValues(data: ISpeciesDetails): SpeciesFormValues {
    return {
        name: data.name,
        scientificName: data.scientificName ?? '',
        categoryIds: data.categoryIds,
        description: data.description ?? '',
        imageURL: data.imageURL ?? '',
        waterType: data.waterType ?? undefined,
        minTemperature: data.minTemperature ?? undefined,
        maxTemperature: data.maxTemperature ?? undefined,
        minPh: data.minPh ?? undefined,
        maxPh: data.maxPh ?? undefined,
        minGh: data.minGh ?? undefined,
        maxGh: data.maxGh ?? undefined,
        minKh: data.minKh ?? undefined,
        maxKh: data.maxKh ?? undefined,
        minVolume: data.minVolume ?? undefined,
        aggressiveness: data.aggressiveness ?? undefined,
    };
}

export default function SpeciesFormDialog({
    open,
    data = null,
    categoryOptions,
    isLoading = false,
    onClose,
    onSave,
}: SpeciesFormDialogProps): React.JSX.Element {
    const [error, setError] = useState<string | null>(null);

    const handleClose = (): void => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (values: SpeciesFormValues): Promise<void> => {
        setError(null);
        try {
            await onSave(values, data);
            handleClose();
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
        }
    };

    return (
        <Dialog open={open} onClose={isLoading ? undefined : handleClose} fullWidth maxWidth="md">
            <DialogTitle>{data ? 'Modifier une espèce' : 'Créer une espèce'}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {/* La clé remonte le formulaire à chaque espèce : pas de reset manuel à gérer. */}
                <SpeciesForm
                    key={data?.id ?? 'new'}
                    initialValues={data ? toFormValues(data) : undefined}
                    categoryOptions={categoryOptions}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    submitLabel={data ? 'Modifier' : 'Créer'}
                />
            </DialogContent>
        </Dialog>
    );
}
