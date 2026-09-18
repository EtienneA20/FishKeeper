'use client';

import { Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { userSchema, type UserFormValues } from '../schema/user.schema';

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
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: yupResolver(userSchema),
        defaultValues: {
            name: initialValues?.name ?? '',
            email: initialValues?.email ?? '',
        },
    });

    useEffect(() => {
        reset({
            name: initialValues?.name ?? '',
            email: initialValues?.email ?? '',
        });
    }, [initialValues?.email, initialValues?.name, reset]);

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
                <Stack direction="row"  spacing={1}>
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
