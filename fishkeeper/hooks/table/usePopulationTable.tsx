import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';

import type { IAquariumPopulationDetails } from '@/interface/entity/aquarium-population.entity';

interface UsePopulationTableProps {
    handleOpenEdit: (population: IAquariumPopulationDetails) => void;
    handleDelete: (population: IAquariumPopulationDetails) => void;
}

export function formatPopulationDate(value: Date | string): string {
    return new Date(value).toLocaleDateString('fr-FR');
}

export const usePopulationTable = ({
    handleOpenEdit,
    handleDelete,
}: UsePopulationTableProps): GridColDef<IAquariumPopulationDetails>[] => [
    {
        field: 'name',
        headerName: 'Nom',
        flex: 1,
        minWidth: 140,
        valueFormatter: (value: IAquariumPopulationDetails['name']) => value || '—',
    },
    {
        field: 'species',
        headerName: 'Espèce',
        flex: 1,
        minWidth: 180,
        valueGetter: (value: IAquariumPopulationDetails['species']) => value.name,
    },
    {
        field: 'aquarium',
        headerName: 'Aquarium',
        flex: 1,
        minWidth: 160,
        valueGetter: (value: IAquariumPopulationDetails['aquarium']) => value.name,
    },
    {
        field: 'owner',
        headerName: 'Propriétaire',
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => row.aquarium.ownerName,
    },
    {
        field: 'introducedAt',
        headerName: 'Introduit le',
        type: 'date',
        width: 130,
        valueGetter: (value: IAquariumPopulationDetails['introducedAt']) => new Date(value),
        valueFormatter: (value: Date) => formatPopulationDate(value),
    },
    {
        field: 'size',
        headerName: 'Taille',
        type: 'number',
        width: 100,
        valueFormatter: (value: IAquariumPopulationDetails['size']) =>
            value != null ? `${value} cm` : '—',
    },
    {
        field: 'weight',
        headerName: 'Poids',
        type: 'number',
        width: 100,
        valueFormatter: (value: IAquariumPopulationDetails['weight']) =>
            value != null ? `${value} g` : '—',
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 250,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<IAquariumPopulationDetails>) => (
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
