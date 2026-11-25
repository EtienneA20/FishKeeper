'use client';

import { Autocomplete, Box, Button, CircularProgress, Grid, Stack, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { searchSpeciesOptions } from '@/actions/species.controller';
import NumberField from '@/components/utils/NumberField';
import { POPULATION_LIMITS, POPULATION_MIN_DATE, TEXT_LIMITS } from '@/constants/form-limits';
import type { IPopulationAquariumOption } from '@/interface/entity/aquarium-population.entity';
import type { ISpeciesOption } from '@/interface/entity/species.entity';
import {
    populationSchema,
    todayAsInputValue,
    type PopulationFormValues,
} from '../schema/population.schema';

const SEARCH_DELAY_MS = 300;

interface PopulationFormProps {
    initialValues?: Partial<PopulationFormValues>;
    /** Espèce déjà sélectionnée (modification), affichée sans attendre une recherche. */
    initialSpecies?: ISpeciesOption | null;
    aquariumOptions: IPopulationAquariumOption[];
    isLoading?: boolean;
    onSubmit: (values: PopulationFormValues) => void | Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export function formatAquariumOption(option: IPopulationAquariumOption): string {
    return `${option.name} — ${option.ownerName}`;
}

function formatSpeciesOption(option: ISpeciesOption): string {
    return option.scientificName ? `${option.name} (${option.scientificName})` : option.name;
}

export default function PopulationForm({
    initialValues,
    initialSpecies = null,
    aquariumOptions,
    isLoading = false,
    onSubmit,
    onCancel,
    submitLabel = 'Enregistrer',
}: PopulationFormProps): React.JSX.Element {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<PopulationFormValues>({
        resolver: yupResolver(populationSchema),
        defaultValues: {
            ...initialValues,
            name: initialValues?.name ?? '',
            introducedAt: initialValues?.introducedAt ?? todayAsInputValue(),
            notes: initialValues?.notes ?? '',
            imageURL: initialValues?.imageURL ?? '',
            aquariumId: initialValues?.aquariumId ?? '',
            speciesId: initialValues?.speciesId ?? '',
        },
    });

    const aquariumsById = useMemo(
        () => new Map(aquariumOptions.map((option) => [option.id, option])),
        [aquariumOptions]
    );

    // Recherche des espèces côté serveur : la base en contient trop pour tout charger.
    const [selectedSpecies, setSelectedSpecies] = useState<ISpeciesOption | null>(initialSpecies);
    const [speciesSearch, setSpeciesSearch] = useState('');
    const [speciesOptions, setSpeciesOptions] = useState<ISpeciesOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        let isActive = true;
        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const options = await searchSpeciesOptions(speciesSearch);
                if (isActive) setSpeciesOptions(options);
            } catch {
                if (isActive) setSpeciesOptions([]);
            } finally {
                if (isActive) setIsSearching(false);
            }
        }, SEARCH_DELAY_MS);

        return () => {
            isActive = false;
            clearTimeout(timeout);
        };
    }, [speciesSearch]);

    // L'option sélectionnée doit rester dans la liste pour qu'Autocomplete l'affiche.
    const displayedSpeciesOptions = useMemo(
        () =>
            selectedSpecies && !speciesOptions.some((option) => option.id === selectedSpecies.id)
                ? [selectedSpecies, ...speciesOptions]
                : speciesOptions,
        [selectedSpecies, speciesOptions]
    );

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2} sx={{ pt: 1 }}>
                <Controller
                    name="aquariumId"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            options={aquariumOptions}
                            value={aquariumsById.get(field.value) ?? null}
                            onChange={(_event, selected) => field.onChange(selected?.id ?? '')}
                            getOptionLabel={formatAquariumOption}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            disabled={isLoading}
                            noOptionsText="Aucun aquarium"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Aquarium"
                                    error={Boolean(errors.aquariumId)}
                                    helperText={errors.aquariumId?.message}
                                />
                            )}
                        />
                    )}
                />
                <Controller
                    name="speciesId"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            options={displayedSpeciesOptions}
                            value={selectedSpecies}
                            onChange={(_event, selected) => {
                                setSelectedSpecies(selected);
                                field.onChange(selected?.id ?? '');
                            }}
                            onInputChange={(_event, value, reason) => {
                                if (reason === 'input' || reason === 'clear') setSpeciesSearch(value);
                            }}
                            // Le filtrage est fait par le serveur.
                            filterOptions={(options) => options}
                            getOptionLabel={formatSpeciesOption}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={isSearching}
                            loadingText="Recherche..."
                            disabled={isLoading}
                            noOptionsText="Aucune espèce trouvée"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Espèce"
                                    error={Boolean(errors.speciesId)}
                                    helperText={
                                        errors.speciesId?.message ??
                                        'Tapez un nom ou un nom scientifique pour rechercher.'
                                    }
                                />
                            )}
                        />
                    )}
                />
                <TextField
                    label="Nom"
                    {...register('name')}
                    slotProps={{ htmlInput: { maxLength: TEXT_LIMITS.name } }}
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    fullWidth
                    disabled={isLoading}
                />
                <TextField
                    label="Date d'introduction"
                    type="date"
                    {...register('introducedAt')}
                    error={Boolean(errors.introducedAt)}
                    helperText={errors.introducedAt?.message}
                    fullWidth
                    disabled={isLoading}
                    slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { min: POPULATION_MIN_DATE, max: todayAsInputValue() },
                    }}
                />
                <Grid container spacing={2}>
                    {(
                        [
                            ['size', 'Taille (cm)', POPULATION_LIMITS.size],
                            ['weight', 'Poids (g)', POPULATION_LIMITS.weight],
                        ] as const
                    ).map(([name, label, limit]) => (
                        <Grid key={name} size={{ xs: 12, sm: 6 }}>
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
                                        disabled={isLoading}
                                    />
                                )}
                            />
                        </Grid>
                    ))}
                </Grid>
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
                <TextField
                    label="Notes"
                    {...register('notes')}
                    slotProps={{ htmlInput: { maxLength: TEXT_LIMITS.notes } }}
                    error={Boolean(errors.notes)}
                    helperText={errors.notes?.message}
                    fullWidth
                    multiline
                    minRows={3}
                    disabled={isLoading}
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
