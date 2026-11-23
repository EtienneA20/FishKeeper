'use client';

import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { ALERT_THRESHOLD_DAYS } from '@/constants/equipment.constant';

interface MaterialStatusBarProps {
    daysRemaining: number;
    totalDays?: number;
}

export default function MaterialStatusBar({
    daysRemaining,
    totalDays = 100,
}: MaterialStatusBarProps): React.JSX.Element {
    const isAlert = daysRemaining < ALERT_THRESHOLD_DAYS;
    const isOverdue = daysRemaining < 0;

    const label = isAlert ? 'Fin de cycle — Contrôle requis' : "Cycle d'entretien";
    const remainingText = isOverdue
        ? `Échéance dépassée de ${Math.abs(daysRemaining)} jour${Math.abs(daysRemaining) > 1 ? 's' : ''}`
        : `Reste ~${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`;

    const progress = Math.min(
        100,
        Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100),
    );

    const dotColor = isAlert ? '#BA1A1A' : '#10B981';
    const labelColor = isAlert ? '#BA1A1A' : '#047857';
    const barColor = isAlert ? '#93000A' : '#006591';

    return (
        <Box
            sx={{
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                backgroundColor: '#EFF4FF',
                border: '1px solid',
                borderColor: '#E5EAF5',
                borderRadius: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            flexShrink: 0,
                            backgroundColor: dotColor,
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{ color: labelColor, fontWeight: 500 }}
                    >
                        {label}
                    </Typography>
                </Box>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'card.colorTitle',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        textAlign: 'right',
                    }}
                >
                    {remainingText}
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={progress}
                aria-label={remainingText}
                sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'card.backgroundInput',
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        backgroundColor: barColor,
                    },
                }}
            />
        </Box>
    );
}
