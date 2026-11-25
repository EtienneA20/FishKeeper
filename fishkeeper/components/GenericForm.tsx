'use client';

import React, { useState } from 'react';
import {
    Alert,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import DialogButton from './DialogButton';

export interface FormField {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    defaultValueList?: string;
    options?: { value: string; label: string }[];
}

interface GenericFormProps {
    title: string;
    open: boolean;
    onClose: () => void;
    fields: FormField[];
    onSubmit: (values: Record<string, string>) => Promise<void>;
    submitLabel?: string;
}

export default function GenericForm({
    title,
    open,
    onClose,
    fields,
    onSubmit,
    submitLabel = 'Enregistrer',
}: GenericFormProps): React.JSX.Element {
    const [error, setError] = useState<string | null>(null);

    const handleClose = (): void => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const values: Record<string, string> = {};
        for (const field of fields) {
            values[field.name] = String(formData.get(field.name) ?? '');
        }
        try {
            await onSubmit(values);
            handleClose();
        } catch (submitError) {
            setError(
                submitError instanceof Error ? submitError.message : 'Une erreur est survenue.',
            );
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"  
                slotProps={{
                paper: {
                    sx: {
                        backgroundColor: 'card.background', border: '1px solid', 
                        borderColor: 'card.borderColor', borderRadius: 4
                    },
                },
            }}>
            <DialogTitle sx={{textAlign: "center", fontSize: "1.5em", fontWeight: 700, pb: 1.5}}>{title}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}>
                            {fields.map((field) => (
                                <TextField
                                    key={field.name}
                                    name={field.name}
                                    label={field.label}
                                    type={field.type}
                                    required={field.required}
                                    select={Boolean(field.options)}
                                    defaultValue={field.defaultValueList ?? field.options?.[0]?.value}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    fullWidth
                                >
                                    {field.options?.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            ))}
                        </Box>
                        <DialogButton
                            type="submit"
                            label={submitLabel}
                            backgroundColor="darkBlueButton.background"
                            textColor="darkBlueButton.colorText"
                        />
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
