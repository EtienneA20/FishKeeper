'use client';

import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { getUserSchema, type UserFormValues } from '../schema/user.schema';
import { useSession } from 'next-auth/react';
import { EROLE, EROLE_LABEL, getAssignableRoles } from '@/constants/enum/role.enum';

interface UserFormProps {
    initialValues?: Partial<UserFormValues>;
    isLoading?: boolean;
    onSubmit: (values: UserFormValues) => void | Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    /**
     * - create  : création depuis /data/user (mot de passe obligatoire)
     * - edit    : modification depuis /data/user (mot de passe facultatif)
     * - profile : modification de son propre profil (pas de choix du rôle)
     */
    mode?: UserFormMode;
}

export type UserFormMode = 'create' | 'edit' | 'profile';

export default function UserForm({
    initialValues,
    isLoading = false,
    onSubmit,
    onCancel,
    submitLabel = 'Enregistrer',
    mode = 'create',
}: UserFormProps): React.JSX.Element {
    const { data: session } = useSession();
    const isEditing = mode !== 'create';
    const showRole = mode !== 'profile';
    // Mêmes règles que le back (getAssignableRoles) : ADMIN → USER, SUDO → tous.
    const assignableRoles = getAssignableRoles(session?.user.role);
    const [changePassword, setChangePassword] = useState(false);
    const requirePassword = !isEditing || changePassword;
    const schema = useMemo(() => getUserSchema(requirePassword), [requirePassword]);
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: yupResolver(schema),
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
            <Stack spacing={2} sx={{ mt: 1 }}>
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

                {showRole && (
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
                                    {assignableRoles.map((role) => (
                                        <MenuItem key={role} value={role}>
                                            {EROLE_LABEL[role]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.role && (
                            <FormHelperText>{errors.role.message}</FormHelperText>
                        )}
                    </FormControl>
                )}

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
                {isEditing && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={changePassword}
                                onChange={(event) => {
                                    setChangePassword(event.target.checked);
                                    setValue('password', '');
                                    clearErrors('password');
                                }}
                                disabled={isLoading}
                            />
                        }
                        label="Modifier le mot de passe"
                    />
                )}
                {requirePassword && (
                    <TextField
                        label={isEditing ? 'Nouveau mot de passe' : 'Mot de passe'}
                        type="password"
                        autoComplete="new-password"
                        {...register('password')}
                        error={Boolean(errors.password)}
                        helperText={errors.password?.message}
                        fullWidth
                        disabled={isLoading}
                    />
                )}

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
