'use client';

import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

import type { ISpeciesCategoryDetails } from '@/interface/entity/species-category.entity';

interface CategoryCardProps {
    category: ISpeciesCategoryDetails;
    onEdit: (category: ISpeciesCategoryDetails) => void;
    onDelete: (category: ISpeciesCategoryDetails) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps): React.JSX.Element {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%' }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" noWrap>
                            {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {category.speciesCount} espèce{category.speciesCount > 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color={category.description ? 'text.primary' : 'text.secondary'}>
                        {category.description || 'Pas de description'}
                    </Typography>
                    <Stack spacing={0.5}>
                        <Typography variant="body2">Incompatible avec :</Typography>
                        {category.incompatibleCategories.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Aucune catégorie
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {category.incompatibleCategories.map((incompatible) => (
                                    <Chip key={incompatible.id} label={incompatible.name} size="small" color="warning" />
                                ))}
                            </Box>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                        <Button variant="outlined" size="small" onClick={() => onEdit(category)}>
                            Modifier
                        </Button>
                        <Button variant="contained" color="error" size="small" onClick={() => onDelete(category)}>
                            Supprimer
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
