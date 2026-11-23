'use client';

import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';

import { EROLE } from '@/constants/enum/role.enum';
import type { IUser } from '../../interface/entity/user.entity';
import UserForm, { type UserFormMode } from '../form/UserForm';
import type { UserFormValues } from '../schema/user.schema';

interface UserFormDialogProps {
    open: boolean;
    data?: IUser | null;
    isLoading?: boolean;
    /** true : l'utilisateur modifie son propre profil (rôle non modifiable). */
    isProfile?: boolean;
    onClose: () => void;
    onSave: (
        values: UserFormValues,
        data: IUser | null,
    ) => void | Promise<void>;
}

const TITLES: Record<UserFormMode, string> = {
    create: 'Créer un utilisateur',
    edit: 'Modifier un utilisateur',
    profile: 'Modifier mon profil',
};

export default function UserFormDialog({
    open,
    data = null,
    isLoading = false,
    isProfile = false,
    onClose,
    onSave,
}: UserFormDialogProps): React.JSX.Element {
    const mode: UserFormMode = isProfile ? 'profile' : data ? 'edit' : 'create';
    const [error, setError] = useState<string | null>(null);

    const handleClose = (): void => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (values: UserFormValues): Promise<void> => {
        setError(null);
        try {
            await onSave(values, data);
            handleClose();
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : handleClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>{TITLES[mode]}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <UserForm
                    initialValues={
                        data
                            ? {
                                  name: data.name ?? '',
                                  email: data.email,
                                  role: data.role ?? EROLE.USER,
                                  departement: data.departement ?? '',
                                  imageURL: data.imageURL ?? '',
                              }
                            : { role: EROLE.USER, password: '', imageURL: '' }
                    }
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    submitLabel={mode === 'create' ? 'Créer' : 'Modifier'}
                    mode={mode}
                />
            </DialogContent>
        </Dialog>
    );
}
