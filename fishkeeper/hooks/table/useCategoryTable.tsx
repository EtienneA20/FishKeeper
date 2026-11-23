import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Button, Chip, Typography } from '@mui/material';

import type { ISpeciesCategoryDetails } from '@/interface/entity/species-category.entity';

interface UseCategoryTableProps {
    handleOpenEdit: (category: ISpeciesCategoryDetails) => void;
    handleDelete: (category: ISpeciesCategoryDetails) => void;
}

export const useCategoryTable = ({
    handleOpenEdit,
    handleDelete,
}: UseCategoryTableProps): GridColDef<ISpeciesCategoryDetails>[] => [
    { field: 'name', headerName: 'Nom', flex: 1, minWidth: 160 },
    {
        field: 'description',
        headerName: 'Description',
        flex: 1.5,
        minWidth: 200,
        valueFormatter: (value: ISpeciesCategoryDetails['description']) => value || '—',
    },
    {
        field: 'speciesCount',
        headerName: 'Espèces',
        type: 'number',
        width: 100,
    },
    {
        field: 'incompatibleCategories',
        headerName: 'Incompatible avec',
        flex: 1.5,
        minWidth: 220,
        sortable: false,
        valueGetter: (value: ISpeciesCategoryDetails['incompatibleCategories']) =>
            value.map((category) => category.name).join(', '),
        renderCell: (params: GridRenderCellParams<ISpeciesCategoryDetails>) =>
            params.row.incompatibleCategories.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 'inherit' }}>
                    Aucune
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%', overflow: 'hidden' }}>
                    {params.row.incompatibleCategories.map((category) => (
                        <Chip key={category.id} label={category.name} size="small" color="warning" />
                    ))}
                </Box>
            ),
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 250,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<ISpeciesCategoryDetails>) => (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                <Button variant="outlined" size="small" onClick={() => handleOpenEdit(params.row)}>
                    Modifier
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(params.row)}
                >
                    Supprimer
                </Button>
            </Box>
        ),
    },
];
