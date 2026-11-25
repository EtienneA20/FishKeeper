'use client';

import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { ALERT_THRESHOLD_DAYS } from '@/constants/equipment.constant';

interface MaterialStatusBarProps {
    /** null : aucun cycle d'entretien défini pour cet équipement. */
    daysRemaining: number | null;
    totalDays?: number;
}

export default function MaterialStatusBar({
    daysRemaining,
    totalDays = 100,
}: MaterialStatusBarProps): React.JSX.Element {
    const hasCycle = daysRemaining !== null;
    const isAlert = hasCycle && daysRemaining < ALERT_THRESHOLD_DAYS;
    const isOverdue = hasCycle && daysRemaining < 0;

    const label = isAlert ? 'Contrôle requis' : "Cycle d'entretien";
    let remainingText = 'Aucun cycle défini';
    if (hasCycle) {
        remainingText = isOverdue
            ? `Retard de ${Math.abs(daysRemaining)} j`
            : `Reste ~${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`;
    }

    const progress = hasCycle
        ? Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100))
        : 0;

    let dotColor = isAlert ? '#BA1A1A' : '#10B981';
    let labelColor = isAlert ? '#BA1A1A' : '#047857';
    const barColor = isAlert ? '#93000A' : '#006591';
    if (!hasCycle) {
        dotColor = '#94A3B8';
        labelColor = 'card.colorText';
    }

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
                        fontFamily: hasCycle ? 'monospace' : undefined,
                        fontStyle: hasCycle ? undefined : 'italic',
                        fontWeight: hasCycle ? 600 : 400,
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
