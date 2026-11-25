'use client';

import {
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import NumberField from '@/components/utils/NumberField';
import { AGGRESSIVENESS_LABEL, EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EWaterType, WATER_TYPE_LABEL } from '@/constants/enum/water-type.enum';
import { SPECIES_LIMITS, TEXT_LIMITS, type NumberLimit } from '@/constants/form-limits';
import type { ISpeciesCategory } from '@/interface/entity/species-category.entity';
import { speciesSchema, type SpeciesFormValues } from '../schema/species.schema';

type CategoryOption = Pick<ISpeciesCategory, 'id' | 'name'>;
type NumberFieldName = keyof Pick<
    SpeciesFormValues,
    | 'minTemperature'
    | 'maxTemperature'
    | 'minPh'
    | 'maxPh'
    | 'minGh'
    | 'maxGh'
    | 'minKh'
    | 'maxKh'
    | 'minVolume'
>;

const RANGE_FIELDS: {
    label: string;
    unit?: string;
    min: NumberFieldName;
    max: NumberFieldName;
    limit: NumberLimit;
}[] = [
    {
        label: 'Température',
        unit: '°C',
        min: 'minTemperature',
        max: 'maxTemperature',
        limit: SPECIES_LIMITS.temperature,
    },
    { label: 'pH', min: 'minPh', max: 'maxPh', limit: SPECIES_LIMITS.ph },
    { label: 'GH', unit: '°dGH', min: 'minGh', max: 'maxGh', limit: SPECIES_LIMITS.gh },
    { label: 'KH', unit: '°dKH', min: 'minKh', max: 'maxKh', limit: SPECIES_LIMITS.kh },
];

interface SpeciesFormProps {
    initialValues?: Partial<SpeciesFormValues>;
    categoryOptions: CategoryOption[];
    isLoading?: boolean;
    onSubmit: (values: SpeciesFormValues) => void | Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export default function SpeciesForm({
    initialValues,
    categoryOptions,
    isLoading = false,
    onSubmit,
    onCancel,
    submitLabel = 'Enregistrer',
}: SpeciesFormProps): React.JSX.Element {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<SpeciesFormValues>({
        resolver: yupResolver(speciesSchema),
        defaultValues: {
            ...initialValues,
            name: initialValues?.name ?? '',
            scientificName: initialValues?.scientificName ?? '',
            categoryIds: initialValues?.categoryIds ?? [],
            description: initialValues?.description ?? '',
            imageURL: initialValues?.imageURL ?? '',
        },
    });

    const optionsById = useMemo(
        () => new Map(categoryOptions.map((option) => [option.id, option])),
        [categoryOptions]
    );

    const numberField = (name: NumberFieldName, label: string, limit: NumberLimit): React.JSX.Element => (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <NumberField
                    label={label}
                    name={field.name}
                    inputRef={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    limit={limit}
                    error={Boolean(errors[name])}
                    helperText={errors[name]?.message}
                    fullWidth
                    size="small"
                    disabled={isLoading}
                />
            )}
        />
    );

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                    label="Nom"
                    {...register('name')}
                    slotProps={{ htmlInput: { maxLength: TEXT_LIMITS.name } }}
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    autoFocus
                    fullWidth
                    disabled={isLoading}
                />
                <TextField
                    label="Nom scientifique"
                    {...register('scientificName')}
                    slotProps={{ htmlInput: { maxLength: TEXT_LIMITS.scientificName } }}
                    error={Boolean(errors.scientificName)}
                    helperText={errors.scientificName?.message}
                    fullWidth
                    disabled={isLoading}
                />
                <Controller
                    name="categoryIds"
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
                            noOptionsText="Aucune catégorie"
                            renderValue={(selected, getItemProps) =>
                                selected.map((option, index) => {
                                    const { key, ...itemProps } = getItemProps({ index });
                                    return (
                                        <Chip
                                            key={key}
                                            label={option.name}
                                            size="small"
                                            {...itemProps}
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Catégories"
                                    error={Boolean(errors.categoryIds)}
                                    helperText={errors.categoryIds?.message}
                                />
                            )}
                        />
                    )}
                />
                <TextField
                    label="Description"
                    {...register('description')}
                    slotProps={{ htmlInput: { maxLength: TEXT_LIMITS.description } }}
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                    fullWidth
                    multiline
                    minRows={3}
                    disabled={isLoading}
                />
                <TextField
                    label="URL de l'image"
                    type="url"
                    {...register('imageURL')}
                    slotProps={{ htmlInput: { maxLength: TEXT_LIMITS.url } }}
                    error={Boolean(errors.imageURL)}
                    helperText={errors.imageURL?.message}
                    fullWidth
                    disabled={isLoading}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth error={Boolean(errors.waterType)} disabled={isLoading}>
                        <InputLabel id="water-type-select-label">Type d&apos;eau</InputLabel>
                        <Controller
                            name="waterType"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    labelId="water-type-select-label"
                                    label="Type d'eau"
                                    value={field.value ?? ''}
                                    onChange={(event) =>
                                        field.onChange(
                                            (event.target.value || undefined) as EWaterType | undefined
                                        )
                                    }
                                >
                                    <MenuItem value="">
                                        <em>Non renseigné</em>
                                    </MenuItem>
                                    {Object.values(EWaterType).map((waterType) => (
                                        <MenuItem key={waterType} value={waterType}>
                                            {WATER_TYPE_LABEL[waterType]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.waterType && <FormHelperText>{errors.waterType.message}</FormHelperText>}
                    </FormControl>
                    <FormControl fullWidth error={Boolean(errors.aggressiveness)} disabled={isLoading}>
                        <InputLabel id="aggressiveness-select-label">Agressivité</InputLabel>
                        <Controller
                            name="aggressiveness"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    labelId="aggressiveness-select-label"
                                    label="Agressivité"
                                    value={field.value ?? ''}
                                    onChange={(event) =>
                                        field.onChange(
                                            (event.target.value || undefined) as
                                                | EAggressiveness
                                                | undefined
                                        )
                                    }
                                >
                                    <MenuItem value="">
                                        <em>Non renseigné</em>
                                    </MenuItem>
                                    {Object.values(EAggressiveness).map((aggressiveness) => (
                                        <MenuItem key={aggressiveness} value={aggressiveness}>
                                            {AGGRESSIVENESS_LABEL[aggressiveness]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.aggressiveness && (
                            <FormHelperText>{errors.aggressiveness.message}</FormHelperText>
                        )}
                    </FormControl>
                </Stack>

                <Typography variant="subtitle2">Paramètres de maintenance</Typography>
                <Grid container spacing={2}>
                    {RANGE_FIELDS.map(({ label, unit, min, max, limit }) => {
                        const suffix = unit ? ` (${unit})` : '';
                        return (
                            <Grid key={min} size={{ xs: 12, sm: 6 }}>
                                <Stack direction="row" spacing={1}>
                                    {numberField(min, `${label} min${suffix}`, limit)}
                                    {numberField(max, `${label} max${suffix}`, limit)}
                                </Stack>
                            </Grid>
                        );
                    })}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        {numberField('minVolume', 'Volume minimal du bac (L)', SPECIES_LIMITS.volume)}
                    </Grid>
                </Grid>

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
