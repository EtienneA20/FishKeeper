'use client';

import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    isLoading?: boolean;
    error?: string | null;
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Supprimer',
    isLoading = false,
    error = null,
    onConfirm,
    onClose,
}: ConfirmDialogProps): React.JSX.Element {
    return (
        <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <DialogContentText component="div">{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>
                    Annuler
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => void onConfirm()}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={20} /> : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
