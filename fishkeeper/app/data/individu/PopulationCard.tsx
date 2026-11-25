'use client';

import {
    Avatar,
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
} from '@mui/material';

import RowActions from '@/components/utils/RowActions';
import type { IAquariumPopulationDetails } from '@/interface/entity/aquarium-population.entity';
import { formatCalendarDate, formatWithUnit } from '@/lib/format';

interface PopulationCardProps {
    population: IAquariumPopulationDetails;
    onEdit: (population: IAquariumPopulationDetails) => void;
    onDelete: (population: IAquariumPopulationDetails) => void;
}

export default function PopulationCard({
    population,
    onEdit,
    onDelete,
}: PopulationCardProps): React.JSX.Element {
    const title = population.name || population.species.name;

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%' }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: 'center' }}
                    >
                        <Avatar
                            src={population.imageURL ?? undefined}
                            alt={title}
                            variant="rounded"
                        >
                            {title.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" noWrap>
                                {title}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                            >
                                {population.species.name}
                                {population.species.scientificName &&
                                    ` (${population.species.scientificName})`}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack spacing={0.5}>
                        <Typography variant="body2">
                            Aquarium : {population.aquarium.name} —{' '}
                            {population.aquarium.ownerName}
                        </Typography>
                        <Typography variant="body2">
                            Introduit le :{' '}
                            {formatCalendarDate(population.introducedAt)}
                        </Typography>
                        <Typography variant="body2">
                            Taille : {formatWithUnit(population.size, 'cm')} ·
                            Poids : {formatWithUnit(population.weight, 'g')}
                        </Typography>
                    </Stack>
                    <Typography
                        variant="body2"
                        color={
                            population.notes ? 'text.primary' : 'text.secondary'
                        }
                    >
                        {population.notes || 'Pas de notes'}
                    </Typography>
                    <RowActions
                        sx={{ mt: 'auto' }}
                        onEdit={() => onEdit(population)}
                        onDelete={() => onDelete(population)}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
}
