'use client';

import React, { useState } from 'react';
import {
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/utils/ConfirmDialog';
import EquipmentStatusBar from './EquipmentStatusBar';
import { DEFAULT_EQUIPMENT_IMAGE_URL } from '@/constants/equipment.constant';

interface EquipmentCardProps {
    title: string;
    statusSlotCat?: React.ReactNode;
    statusSlotTyp?: React.ReactNode;
    statusSlotStatus?: React.ReactNode;
    daysRemaining: number | null;
    totalDays?: number | null;
    imageURL?: string | null;
    details?: EquipmentCardDetail[];
    notes?: string | null;
    onDelete?: () => Promise<void>;
}

export interface EquipmentCardDetail {
    label: string;
    value: string;
}

export default function EquipmentCard({
    title,
    statusSlotCat,
    statusSlotStatus,
    daysRemaining,
    totalDays,
    imageURL,
    details = [],
    notes,
    onDelete,
}: EquipmentCardProps): React.JSX.Element {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(menuAnchor);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>): void => {
        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = (): void => {
        setMenuAnchor(null);
    };

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleAskDelete = (): void => {
        handleCloseMenu();
        setDeleteError(null);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (!onDelete) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await onDelete();
            setIsConfirmOpen(false);
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'Erreur lors de la suppression.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Box
            sx={{
                height: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: 'card.background',
                border: '1px solid',
                borderColor: 'card.borderColor',
                borderRadius: 4,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                    component="img"
                    src={imageURL ?? DEFAULT_EQUIPMENT_IMAGE_URL}
                    alt={title}
                    sx={{
                        width: 56,
                        height: 56,
                        flexShrink: 0,
                        objectFit: 'cover',
                        borderRadius: 3,
                        border: `1px solid rgba(0, 0, 0, 0.1)`,
                    }}
                />

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 1,
                        flexGrow: 1,
                        minWidth: 0,
                    }}
                >
                    <Box sx={{
                        display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1,
                    }}>
                        {statusSlotStatus}
                        {statusSlotCat}
                    </Box>
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                            color: 'card.colorTitle',
                            fontWeight: 700,
                            lineHeight: 1.3,
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                <IconButton
                    size="small"
                    aria-label="Plus d'actions"
                    aria-controls={isMenuOpen ? 'equipment-actions-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen ? 'true' : undefined}
                    onClick={handleOpenMenu}
                    sx={{ color: 'card.colorText', mt: -0.5, mr: -0.5 }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                    id="equipment-actions-menu"
                    anchorEl={menuAnchor}
                    open={isMenuOpen}
                    onClose={handleCloseMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{
                        paper: {
                            sx: {
                                minWidth: 160,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
                            },
                        },
                    }}
                >
                    <MenuItem onClick={handleCloseMenu}>
                        <ListItemIcon>
                            <Pencil size={16} />
                        </ListItemIcon>
                        <ListItemText>Modifier</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleAskDelete} sx={{ color: '#DC2626' }}>
                        <ListItemIcon sx={{ color: 'inherit' }}>
                            <Trash2 size={16} />
                        </ListItemIcon>
                        <ListItemText>Supprimer</ListItemText>
                    </MenuItem>
                </Menu>

                <ConfirmDialog
                    open={isConfirmOpen}
                    title="Supprimer l'équipement ?"
                    isLoading={isDeleting}
                    error={deleteError}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={handleConfirmDelete}
                    message={
                        <>
                            Êtes-vous sûr de vouloir supprimer <strong>{title}</strong> ?
                            Cette action est irréversible.
                        </>
                    }
                />
            </Box>

            <EquipmentStatusBar
                daysRemaining={daysRemaining}
                totalDays={totalDays ?? undefined}
            />

            {details.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', px: 1 }}>
                    {details.map((detail, index) => (
                        <Box
                            key={detail.label}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                py: 1,
                                borderTop: index === 0 ? 'none' : '1px solid',
                                borderColor: 'card.borderColor',
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{ color: 'card.colorText' }}
                            >
                                {detail.label}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'card.colorTitle',
                                    fontWeight: 500,
                                    textAlign: 'right',
                                }}
                            >
                                {detail.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
            <Box
                sx={{
                    p: 1.5, 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: 1.5,
                    alignItems: 'center',

                }}
            >
                <Typography
                        variant="body2"
                        sx={{ color: 'card.colorText' }}
                >
                    Notes
                </Typography>
                <Box
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: '1',
                        alignItems: 'center',
                        gap: 1.5,
                        backgroundColor: '#EFF4FF',
                        border: '1px solid',
                        borderColor: '#E5EAF5',
                        borderRadius: 2,
                    }}
                    >
                    <Typography
                        variant="body2"
                        sx={{ color: 'card.colorText' }}
                    >
                        {notes == null ? "Aucune note enregistrée" : notes}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
