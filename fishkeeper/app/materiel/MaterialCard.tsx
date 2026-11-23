'use client';

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MaterialStatusBar from './MaterialStatusBar';
import { DEFAULT_EQUIPMENT_IMAGE_URL } from '@/constants/equipment.constant';

interface MaterialCardProps {
    title: string;
    statusSlotCat?: React.ReactNode;
    statusSlotTyp?: React.ReactNode;
    statusSlotStatus?: React.ReactNode;
    daysRemaining: number | null;
    totalDays?: number | null;
    imageURL?: string | null;
    details?: MaterialCardDetail[];
    notes?: string | null;
}

export interface MaterialCardDetail {
    label: string;
    value: string;
}

export default function MaterialCard({
    title,
    statusSlotCat,
    statusSlotStatus,
    daysRemaining,
    totalDays,
    imageURL,
    details = [],
    notes,
}: MaterialCardProps): React.JSX.Element {
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
                    sx={{ color: 'card.colorText', mt: -0.5, mr: -0.5 }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Box>

            {daysRemaining !== null && (
                <MaterialStatusBar
                    daysRemaining={daysRemaining}
                    totalDays={totalDays ?? undefined}
                />
            )}

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
