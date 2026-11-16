'use client';

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MaterialStatusBar from './MaterialStatusBar';

interface MaterialCardProps {
    title: string;
    statusSlotCat?: React.ReactNode;
    statusSlotTyp?: React.ReactNode;
    status: string;
    daysRemaining: number | null;
    totalDays?: number | null;
}

export default function MaterialCard({
    title,
    statusSlotCat,
    statusSlotTyp,
    status,
    daysRemaining,
    totalDays,
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
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        p: 1,
                        borderRadius: 3,
                        border: `1px solid rgba(0, 0, 0, 0.1)`,
                        backgroundColor: 'card.backgroundInput',
                        color: 'darkBlueButton.background',
                    }}
                >
                    <CleaningServicesIcon />
                </Box>

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
                        display: 'flex', flexDirection: 'row', gap: 1,
                    }}> 
                        {statusSlotCat}
                        {statusSlotTyp}
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
                    status={status}
                    daysRemaining={daysRemaining}
                    totalDays={totalDays ?? undefined}
                />
            )}
        </Box>
    );
}
