'use client';

import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { userSchema, type UserFormValues } from '../schema/user.schema';
import { EROLE, ROLE_LABELS } from '@/constants/enum/role.enum';

interface UserFormProps {
    initialValues?: Partial<UserFormValues>;
    isLoading?: boolean;
    onSubmit: (values: UserFormValues) => void | Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export default function UserForm({
    initialValues,
    isLoading = false,
    onSubmit,
    onCancel,
    submitLabel = 'Enregistrer',
}: UserFormProps): React.JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: yupResolver(userSchema),
        defaultValues: {
            name: initialValues?.name ?? '',
            email: initialValues?.email ?? '',
            role: initialValues?.role ?? EROLE.USER,
            departement: initialValues?.departement ?? '',
            password: initialValues?.password ?? '',
            imageURL: initialValues?.imageURL ?? '',
        },
    });

    useEffect(() => {
        reset({
            name: initialValues?.name ?? '',
            email: initialValues?.email ?? '',
            role: initialValues?.role ?? EROLE.USER,
            departement: initialValues?.departement ?? '',
            password: initialValues?.password ?? '',
            imageURL: initialValues?.imageURL ?? '',
        });
    }, [initialValues?.email, initialValues?.name, initialValues?.role, initialValues?.departement, initialValues?.password, initialValues?.imageURL, reset]);

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
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
                    label="Adresse e-mail"
                    type="email"
                    {...register('email')}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    fullWidth
                    disabled={isLoading}
                />

                <FormControl fullWidth error={Boolean(errors.role)} disabled={isLoading}>
                    <InputLabel id="role-select-label">Rôle</InputLabel>
                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                labelId="role-select-label"
                                label="Rôle"
                                value={field.value ?? EROLE.USER}
                                onChange={(event) =>
                                    field.onChange(event.target.value as EROLE)
                                }
                            >
                                {Object.values(EROLE).map((role, index) => (
                                    <MenuItem key={index} value={role}>
                                        {ROLE_LABELS[index]}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                    {errors.role && (
                        <FormHelperText>{errors.role.message}</FormHelperText>
                    )}
                </FormControl>

                <TextField
                    label="Département"
                    {...register('departement')}
                    error={Boolean(errors.departement)}
                    helperText={errors.departement?.message}
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
                />
                <TextField
                    label="Mot de passe"
                    type="password"
                    {...register('password')}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message ?? 'Laissez vide pour conserver le mot de passe actuel.'}
                    fullWidth
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
