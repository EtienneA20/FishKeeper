'use client';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import type { IUser } from '../../interface/entity/user.entity';
import UserForm from '../form/UserForm';
import type { UserFormValues } from '../schema/user.schema';

interface UserFormDialogProps {
    open: boolean;
    data?: IUser | null;
    isLoading?: boolean;
    onClose: () => void;
    onSave: (
        values: UserFormValues,
        data: IUser | null,
    ) => void | Promise<void>;
}

export default function UserFormDialog({
    open,
    data = null,
    isLoading = false,
    onClose,
    onSave,
}: UserFormDialogProps): React.JSX.Element {
    const isEditing = data !== null;

    const handleSubmit = async (values: UserFormValues): Promise<void> => {
        await onSave(values, data);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                {isEditing ? 'Modifier un utilisateur' : 'Créer un utilisateur'}
            </DialogTitle>
            <DialogContent>
                <UserForm
                    initialValues={
                        data
                            ? { name: data.name, email: data.email }
                            : undefined
                    }
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    submitLabel={isEditing ? 'Modifier' : 'Créer'}
                />
            </DialogContent>
        </Dialog>
    );
}
