'use client';

import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useMemo, useState } from 'react';

import type { ISpeciesCategoryDetails } from '@/interface/entity/species-category.entity';
import CategoryForm from '../form/CategoryForm';
import type { CategoryFormValues } from '../schema/category.schema';

interface CategoryFormDialogProps {
    open: boolean;
    data?: ISpeciesCategoryDetails | null;
    /** Toutes les catégories, pour le choix des incompatibilités. */
    categories: ISpeciesCategoryDetails[];
    isLoading?: boolean;
    onClose: () => void;
    onSave: (
        values: CategoryFormValues,
        data: ISpeciesCategoryDetails | null,
    ) => void | Promise<void>;
}

export default function CategoryFormDialog({
    open,
    data = null,
    categories,
    isLoading = false,
    onClose,
    onSave,
}: CategoryFormDialogProps): React.JSX.Element {
    const [error, setError] = useState<string | null>(null);

    const categoryOptions = useMemo(
        () =>
            categories
                .filter((category) => category.id !== data?.id)
                .map(({ id, name }) => ({ id, name })),
        [categories, data?.id],
    );

    const handleClose = (): void => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (values: CategoryFormValues): Promise<void> => {
        setError(null);
        try {
            await onSave(values, data);
            handleClose();
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
        }
    };

    return (
        <Dialog open={open} onClose={isLoading ? undefined : handleClose} fullWidth maxWidth="sm">
            <DialogTitle>{data ? 'Modifier une catégorie' : 'Créer une catégorie'}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <CategoryForm
                    initialValues={
                        data
                            ? {
                                  name: data.name,
                                  description: data.description ?? '',
                                  incompatibleWithIds: data.incompatibleCategories.map((c) => c.id),
                              }
                            : { name: '', description: '', incompatibleWithIds: [] }
                    }
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
