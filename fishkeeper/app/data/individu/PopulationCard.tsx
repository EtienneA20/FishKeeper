'use client';

import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

import { formatPopulationDate } from '@/hooks/table/usePopulationTable';
import type { IAquariumPopulationDetails } from '@/interface/entity/aquarium-population.entity';

interface PopulationCardProps {
    population: IAquariumPopulationDetails;
    onEdit: (population: IAquariumPopulationDetails) => void;
    onDelete: (population: IAquariumPopulationDetails) => void;
}

export default function PopulationCard({ population, onEdit, onDelete }: PopulationCardProps): React.JSX.Element {
    const title = population.name || population.species.name;

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%' }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <Avatar src={population.imageURL ?? undefined} alt={title} variant="rounded">
                            {title.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" noWrap>
                                {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {population.species.name}
                                {population.species.scientificName && ` (${population.species.scientificName})`}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack spacing={0.5}>
                        <Typography variant="body2">
                            Aquarium : {population.aquarium.name} — {population.aquarium.ownerName}
                        </Typography>
                        <Typography variant="body2">
                            Introduit le : {formatPopulationDate(population.introducedAt)}
                        </Typography>
                        <Typography variant="body2">
                            Taille : {population.size != null ? `${population.size} cm` : '—'} · Poids :{' '}
                            {population.weight != null ? `${population.weight} g` : '—'}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color={population.notes ? 'text.primary' : 'text.secondary'}>
                        {population.notes || 'Pas de notes'}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                        <Button variant="outlined" size="small" onClick={() => onEdit(population)}>
                            Modifier
                        </Button>
                        <Button variant="contained" color="error" size="small" onClick={() => onDelete(population)}>
                            Supprimer
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
