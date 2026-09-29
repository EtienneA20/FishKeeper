'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
    loginSchema,
    registerSchema,
    type AuthFormValues,
} from '../schema/auth.schema';

interface AuthFormProps {
    isRegistering: boolean;
    isLoading?: boolean;
    error?: string | null;
    onSubmit: (values: AuthFormValues) => void | Promise<void>;
    onToggleMode: () => void;
}

export default function AuthForm({
    isRegistering,
    isLoading = false,
    error,
    onSubmit,
    onToggleMode,
}: AuthFormProps): React.JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AuthFormValues>({
        resolver: yupResolver(isRegistering ? registerSchema : loginSchema),
        defaultValues: {
            name: '',
            departement: '',
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        reset({
            name: '',
            departement: '',
            email: '',
            password: '',
        });
    }, [isRegistering, reset]);

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {isRegistering && (
                    <>
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
                            label="Département"
                            {...register('departement')}
                            error={Boolean(errors.departement)}
                            helperText={errors.departement?.message}
                            fullWidth
                            disabled={isLoading}
                        />
                    </>
                )}
                <TextField
                    label="E-mail"
                    type="email"
                    {...register('email')}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    autoFocus={!isRegistering}
                    fullWidth
                    disabled={isLoading}
                />
                <TextField
                    label="Mot de passe"
                    type="password"
                    {...register('password')}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                    fullWidth
                    disabled={isLoading}
                />
                <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                    {isLoading ? (
                        <CircularProgress size={24} />
                    ) : isRegistering ? (
                        'Créer le compte'
                    ) : (
                        'Se connecter'
                    )}
                </Button>
                <Button type="button" onClick={onToggleMode} disabled={isLoading}>
                    {isRegistering ? 'J’ai déjà un compte' : 'Créer un compte'}
                </Button>
            </Stack>
        </Box>
    );
}