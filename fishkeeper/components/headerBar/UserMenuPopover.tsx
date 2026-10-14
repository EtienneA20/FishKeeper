'use client';

import React, { useState } from 'react';
import {
    Box,
    Popover,
    Avatar,
    Typography,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Paper,
    Divider,
} from '@mui/material';
import {
    Sun,
    Moon,
    UserCheck,
    LogOut,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useUser } from '@/hooks/contexts/useUserContext';

interface UserMenuPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
}

export default function UserMenuPopover({
    anchorEl,
    open,
    onClose,
}: UserMenuPopoverProps): React.JSX.Element {
    // Utilisation directe du contrat réel de UserState (isDarkTheme & setIsDarkTheme)
    const { user,setUser, isDarkTheme, setIsDarkTheme } = useUser();

    const handleThemeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newTheme: boolean | null
    ) => {
        if (newTheme !== null) {
            setIsDarkTheme(newTheme);
        }
    };

    const handleLogout = async (): Promise<void> => {
        onClose();
        setUser(null);
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            slotProps={{
                paper: {
                    sx: {
                        width: 320,
                        borderRadius: 5,
                        marginTop : 6,  
                        p: 2.5,
                        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
                        border: '1px solid',
                        borderColor: 'divider',
                    },
                },
            }}
        >
            {/* 1. EN-TÊTE UTILISATEUR */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Avatar
                    src={user?.imageURL ?? undefined}
                    alt={user?.name ?? 'Utilisateur'}
                    sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.4rem' }}
                >
                    {user?.name?.trim().charAt(0).toUpperCase() || ''}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: 1.2 }}
                    >
                        {user?.name ?? 'Alexandre Martin'}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 0.5 }}
                        noWrap
                    >
                        {user?.email ?? 'alexandre.martin@etu.univ.fr'}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 3. BLOC PRÉFÉRENCES */}
            <Paper
                elevation={0}
                sx={{
                    backgroundColor: 'action.hover',
                    p: 1.5,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
                {/* Switch Thème */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        Thème d'affichage
                    </Typography>
                    <ToggleButtonGroup
                        value={isDarkTheme}
                        exclusive
                        onChange={handleThemeChange}
                        size="small"
                        sx={{
                            backgroundColor: 'background.paper',
                            p: 0.3,
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            '& .MuiToggleButton-root': {
                                border: 'none',
                                borderRadius: 3,
                                px: 1.2,
                                py: 0.3,
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                '&.Mui-selected': {
                                    backgroundColor: 'text.primary',
                                    color: 'background.paper',
                                    '&:hover': { backgroundColor: 'text.primary' },
                                },
                            },
                        }}
                    >
                        <ToggleButton value={false}>
                            <Sun size={13} style={{ marginRight: 4 }} /> Clair
                        </ToggleButton>
                        <ToggleButton value={true}>
                            <Moon size={13} style={{ marginRight: 4 }} /> Sombre
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Paper>

            {/* 4. BOUTONS D'ACTION */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<UserCheck size={18} />}
                    sx={{
                        borderRadius: 5,
                        textTransform: 'none',
                        borderColor: 'divider',
                        color: 'text.primary',
                        fontWeight: 600,
                        py: 0.8,
                    }}
                >
                    Modifier le Profil
                </Button>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleLogout}
                    startIcon={<LogOut size={18} />}
                    sx={{
                        borderRadius: 5,
                        textTransform: 'none',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        boxShadow: 'none',
                        fontWeight: 600,
                        py: 0.8,
                        border: '1px solid #FCA5A5',
                        '&:hover': { backgroundColor: '#FEE2E2', boxShadow: 'none' },
                    }}
                >
                    Se déconnecter de la session
                </Button>
            </Box>
        </Popover>
    );
}