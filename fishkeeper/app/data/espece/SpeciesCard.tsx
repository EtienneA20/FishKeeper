'use client';

import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@mui/material';

import RowActions from '@/components/utils/RowActions';
import { AGGRESSIVENESS_LABEL } from '@/constants/enum/aggressiveness.enum';
import { WATER_TYPE_LABEL } from '@/constants/enum/water-type.enum';
import type { ISpeciesDetails } from '@/interface/entity/species.entity';
import { formatRange, formatWithUnit } from '@/lib/format';

interface SpeciesCardProps {
    species: ISpeciesDetails;
    onEdit: (species: ISpeciesDetails) => void;
    onDelete: (species: ISpeciesDetails) => void;
}

export default function SpeciesCard({
    species,
    onEdit,
    onDelete,
}: SpeciesCardProps): React.JSX.Element {
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
                            src={species.imageURL ?? undefined}
                            alt={species.name}
                            variant="rounded"
                        >
                            {species.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" noWrap>
                                {species.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                                sx={{ fontStyle: 'italic' }}
                            >
                                {species.scientificName ||
                                    'Nom scientifique non renseigné'}
                            </Typography>
                        </Box>
                    </Stack>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {species.categories.map((category) => (
                            <Chip
                                key={category.id}
                                label={category.name}
                                size="small"
                            />
                        ))}
                    </Box>
                    <Stack spacing={0.5}>
                        <Typography variant="body2">
                            Type d&apos;eau :{' '}
                            {species.waterType
                                ? WATER_TYPE_LABEL[species.waterType]
                                : '—'}
                        </Typography>
                        <Typography variant="body2">
                            Température :{' '}
                            {formatRange(
                                species.minTemperature,
                                species.maxTemperature,
                                '°C'
                            )}
                        </Typography>
                        <Typography variant="body2">
                            pH : {formatRange(species.minPh, species.maxPh)}
                        </Typography>
                        <Typography variant="body2">
                            GH : {formatRange(species.minGh, species.maxGh)} ·
                            KH : {formatRange(species.minKh, species.maxKh)}
                        </Typography>
                        <Typography variant="body2">
                            Volume minimal :{' '}
                            {formatWithUnit(species.minVolume, 'L')}
                        </Typography>
                        <Typography variant="body2">
                            Agressivité :{' '}
                            {species.aggressiveness
                                ? AGGRESSIVENESS_LABEL[species.aggressiveness]
                                : '—'}
                        </Typography>
                    </Stack>
                    <RowActions
                        sx={{ mt: 'auto' }}
                        onEdit={() => onEdit(species)}
                        onDelete={() => onDelete(species)}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
}
