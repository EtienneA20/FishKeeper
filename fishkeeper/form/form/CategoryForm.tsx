'use client';

import { Autocomplete, Box, Button, Chip, CircularProgress, Stack, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { ISpeciesCategory } from '@/interface/entity/species-category.entity';
import { categorySchema, type CategoryFormValues } from '../schema/category.schema';

type CategoryOption = Pick<ISpeciesCategory, 'id' | 'name'>;

interface CategoryFormProps {
    initialValues?: Partial<CategoryFormValues>;
    categoryOptions: CategoryOption[];
    isLoading?: boolean;
    onSubmit: (values: CategoryFormValues) => void | Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export default function CategoryForm({
    initialValues,
    categoryOptions,
    isLoading = false,
    onSubmit,
    onCancel,
    submitLabel = 'Enregistrer',
}: CategoryFormProps): React.JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<CategoryFormValues>({
        resolver: yupResolver(categorySchema),
        defaultValues: {
            name: initialValues?.name ?? '',
            description: initialValues?.description ?? '',
            incompatibleWithIds: initialValues?.incompatibleWithIds ?? [],
        },
    });

    const incompatibleKey = initialValues?.incompatibleWithIds?.join(',');
    useEffect(() => {
        reset({
            name: initialValues?.name ?? '',
            description: initialValues?.description ?? '',
            incompatibleWithIds: initialValues?.incompatibleWithIds ?? [],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues?.name, initialValues?.description, incompatibleKey, reset]);

    const optionsById = useMemo(
        () => new Map(categoryOptions.map((option) => [option.id, option])),
        [categoryOptions],
    );

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                    label="Nom"
                    {...register('name')}
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    autoFocus
                    fullWidth
                    disabled={isLoading}
                />
                <TextField
                    label="Description"
                    {...register('description')}
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                    fullWidth
                    multiline
                    minRows={3}
                    disabled={isLoading}
                />
                <Controller
                    name="incompatibleWithIds"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            multiple
                            options={categoryOptions}
                            value={field.value
                                .map((id) => optionsById.get(id))
                                .filter((option): option is CategoryOption => Boolean(option))}
                            onChange={(_event, selected) =>
                                field.onChange(selected.map((option) => option.id))
                            }
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            disabled={isLoading}
                            noOptionsText="Aucune autre catégorie"
                            renderValue={(selected, getItemProps) =>
                                selected.map((option, index) => {
                                    const { key, ...itemProps } = getItemProps({ index });
                                    return (
                                        <Chip
                                            key={key}
                                            label={option.name}
                                            color="warning"
                                            size="small"
                                            {...itemProps}
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Catégories incompatibles"
                                    error={Boolean(errors.incompatibleWithIds)}
                                    helperText={
                                        errors.incompatibleWithIds?.message ??
                                        "L'incompatibilité s'applique dans les deux sens."
                                    }
                                />
                            )}
                        />
                    )}
                />

                <Stack direction="row" spacing={1}>
                    <Button type="button" onClick={onCancel} disabled={isLoading}>
                        Annuler
                    </Button>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {isLoading ? <CircularProgress size={20} /> : submitLabel}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
