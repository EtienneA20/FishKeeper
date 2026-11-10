'use client';

import React from 'react';
import { Grid } from '@mui/material';
import MaterialCard from './MaterialCard';
import StatusChip from '../../components/StatusChip';

export interface MaterialItem {
    id: string;
    title: string;
    status: string;
    daysRemaining: number;
}

interface MaterialGridProps {
    materials: MaterialItem[];
}

export default function MaterialGrid({
    materials
}: MaterialGridProps): React.JSX.Element {
    return (
    <Grid container spacing={3} sx={{ mt: 4 }}>
        {materials.map((material) => (
            <Grid key={material.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <MaterialCard 
                    title={material.title}
                    status={material.status}
                    daysRemaining={material.daysRemaining}
                    statusSlot={
                        <StatusChip
                            label="Équipement opérationnels (5/6 en service)"
                            color="#009d8d"
                            backgroundColor="#e5f5f4"
                        />
                    }
                />
            </Grid>
        ))}
    </Grid>
    );
}
