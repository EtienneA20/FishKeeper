'use client';

import React, { useMemo } from 'react';
import { Chip, Grid } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import MaterialCard from './MaterialCard';
import { IEquipment } from '@/interface/entity/equipment.entity';
import { IAquarium } from '@/interface/entity/aquarium.entity';
import {
    EQUIPMENT_STATUS_COLORS,
    EQUIPMENT_STATUS_LABELS,
    EQUIPMENT_TYPES,
} from '@/constants/equipment.constant';


const MS_PER_DAY = 1000 * 60 * 60 * 24;
// Nombre de millisecondes dans une journée (1000 ms × 60 s × 60 min × 24 h).
// Les dates JS se calculent en ms, ça sert à convertir les jours en ms et inversement.


function getDaysRemaining(equipment: IEquipment): number | null {
    if (!equipment.lastMaintainedAt || !equipment.maintenanceInterval) {
        return null;
    }
    const nextMaintenance =
        equipment.lastMaintainedAt.getTime() +
        equipment.maintenanceInterval * MS_PER_DAY;
    return Math.ceil((nextMaintenance - Date.now()) / MS_PER_DAY);
}


interface MaterialGridProps {
    equipments: IEquipment[];
    aquariums: Pick<IAquarium, 'id' | 'name'>[];
}


export default function MaterialGrid({
    equipments,
    aquariums,
}: MaterialGridProps): React.JSX.Element {
    const searchParams = useSearchParams();
    // id → nom, pour afficher le nom de l'aquarium de chaque équipement.
    const aquariumNames = useMemo(
        () => new Map(aquariums.map((aquarium) => [aquarium.id, aquarium.name])),
        [aquariums],
    );
    const category = searchParams.get('category');

    const filteredEquipments = category
        ? equipments.filter(
              (equipment) =>
                  EQUIPMENT_TYPES[equipment.type].category === category
          )
        : equipments;

    return (
        <Grid container spacing={6} sx={{ mt: 6 }}>
            {filteredEquipments.map((equipment) => (
                <Grid key={equipment.id} size={{ xs: 12, md: 6, lg: 4 }}>
                    <MaterialCard
                        title={equipment.name}
                        statusSlotStatus={
                            <Chip
                                size="small"
                                label={EQUIPMENT_STATUS_LABELS[equipment.status]}
                                sx={{
                                    ...EQUIPMENT_STATUS_COLORS[equipment.status],
                                    fontWeight: 600,
                                    borderRadius: 1,
                                }}
                            />
                        }
                        daysRemaining={getDaysRemaining(equipment)}
                        totalDays={equipment.maintenanceInterval}
                        imageURL={equipment.imageURL}
                        details={[
                            {
                                label: 'Modèle',
                                value:
                                    [equipment.brand, equipment.model]
                                        .filter(Boolean)
                                        .join(' ') || '—',
                            },
                            {
                                label: 'Aquarium',
                                value: aquariumNames.get(equipment.aquariumId) ?? '—',
                            },
                            {
                                label: 'Intervale de maintenance',
                                value: equipment.maintenanceInterval
                                    ? `${equipment.maintenanceInterval} jours`
                                    : '—',
                            },
                            {
                                label: 'Dernière maintenance effectué',
                                value: equipment.lastMaintainedAt
                                    ? equipment.lastMaintainedAt.toLocaleDateString('fr-FR')
                                    : '—',
                            },
                        ]}
                        statusSlotCat={
                            <Chip
                                size="small"
                                label={
                                    EQUIPMENT_TYPES[equipment.type].category
                                }
                                sx={{
                                    backgroundColor: 'card.backgroundInput',
                                    color: 'card.colorText',
                                    fontWeight: 500,
                                    borderRadius: 1,
                                }}
                            />
                        }
                        notes={equipment.notes}
                    />
                </Grid>
            ))}
        </Grid>
    );
}
