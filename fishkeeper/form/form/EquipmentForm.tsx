'use client';

import { Box, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import DialogButton from '@/components/DialogButton';
import { EEquipmentStatus } from '@/constants/enum/equipment-status.enum';
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_TYPES } from '@/constants/equipment.constant';
import type { IAquarium } from '@/interface/entity/aquarium.entity';
import { equipmentSchema, type EquipmentFormValues } from '../schema/equipment.schema';

type AquariumOption = Pick<IAquarium, 'id' | 'name'>;

interface EquipmentFormProps {
    initialValues?: Partial<EquipmentFormValues>;
    aquariumOptions: AquariumOption[];
    isLoading?: boolean;
    onSubmit: (values: EquipmentFormValues) => void | Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export default function EquipmentForm({
    initialValues,
    aquariumOptions,
    isLoading = false,
    onSubmit,
    onCancel,
    submitLabel = 'Enregistrer',
}: EquipmentFormProps): React.JSX.Element {
    const getDefaultValues = (): Partial<EquipmentFormValues> => ({
        aquariumId: initialValues?.aquariumId ?? aquariumOptions[0]?.id ?? '',
        name: initialValues?.name ?? '',
        type: initialValues?.type,
        brand: initialValues?.brand ?? '',
        model: initialValues?.model ?? '',
        status: initialValues?.status ?? EEquipmentStatus.WORKING,
        purchasedAt: initialValues?.purchasedAt ?? '',
        maintenanceInterval: initialValues?.maintenanceInterval,
        notes: initialValues?.notes ?? '',
        imageURL: initialValues?.imageURL ?? '',
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<EquipmentFormValues>({
        resolver: yupResolver(equipmentSchema),
        defaultValues: getDefaultValues(),
    });

    useEffect(() => {
        reset(getDefaultValues());
    }, [initialValues, reset]);

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                        pt: 1,
                    }}
                >
                    <Controller
                        name="aquariumId"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                label="Aquarium"
                                error={Boolean(errors.aquariumId)}
                                helperText={errors.aquariumId?.message}
                                fullWidth
                                disabled={isLoading}
                            >
                                {aquariumOptions.map((aquarium) => (
                                    <MenuItem key={aquarium.id} value={aquarium.id}>
                                        {aquarium.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />
                    <TextField
                        label="Nom"
                        {...register('name')}
                        error={Boolean(errors.name)}
                        helperText={errors.name?.message}
                        fullWidth
                        disabled={isLoading}
                    />
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                value={field.value ?? ''}
                                select
                                label="Type"
                                error={Boolean(errors.type)}
                                helperText={errors.type?.message}
                                fullWidth
                                disabled={isLoading}
                            >
                                {Object.entries(EQUIPMENT_TYPES).map(([value, info]) => (
                                    <MenuItem key={value} value={value}>
                                        {info.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                label="Statut"
                                error={Boolean(errors.status)}
                                helperText={errors.status?.message}
                                fullWidth
                                disabled={isLoading}
                            >
                                {Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />
                    <TextField
                        label="Marque"
                        {...register('brand')}
                        error={Boolean(errors.brand)}
                        helperText={errors.brand?.message}
                        fullWidth
                        disabled={isLoading}
                    />
                    <TextField
                        label="Modèle"
                        {...register('model')}
                        error={Boolean(errors.model)}
                        helperText={errors.model?.message}
                        fullWidth
                        disabled={isLoading}
                    />
                    <TextField
                        label="Date d'achat"
                        type="date"
                        {...register('purchasedAt')}
                        error={Boolean(errors.purchasedAt)}
                        helperText={errors.purchasedAt?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                        disabled={isLoading}
                    />
                    <TextField
                        label="Intervalle de maintenance (jours)"
                        type="number"
                        {...register('maintenanceInterval')}
                        error={Boolean(errors.maintenanceInterval)}
                        helperText={errors.maintenanceInterval?.message}
                        fullWidth
                        disabled={isLoading}
                    />
                    <TextField
                        label="URL de l'image"
                        type="url"
                        {...register('imageURL')}
                        error={Boolean(errors.imageURL)}
                        helperText={errors.imageURL?.message}
                        fullWidth
                        disabled={isLoading}
                        sx={{ gridColumn: '1 / -1' }}
                    />
                    <TextField
                        label="Notes"
                        {...register('notes')}
                        error={Boolean(errors.notes)}
                        helperText={errors.notes?.message}
                        fullWidth
                        multiline
                        minRows={3}
                        disabled={isLoading}
                        sx={{ gridColumn: '1 / -1' }}
                    />
                </Box>

                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <DialogButton
                        type="button"
                        label="Annuler"
                        backgroundColor="grey.700"
                        textColor="common.white"
                        onClick={onCancel}
                        disabled={isLoading}
                    />
                    <DialogButton
                        type="submit"
                        label={isLoading ? undefined : submitLabel}
                        startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
                        backgroundColor="darkBlueButton.background"
                        textColor="darkBlueButton.colorText"
                        disabled={isLoading}
                    />
                </Stack>
            </Stack>
        </Box>
    );
}
