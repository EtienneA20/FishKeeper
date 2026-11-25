import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Button, Chip } from '@mui/material';

import { AGGRESSIVENESS_LABEL } from '@/constants/enum/aggressiveness.enum';
import { WATER_TYPE_LABEL } from '@/constants/enum/water-type.enum';
import type { ISpeciesDetails } from '@/interface/entity/species.entity';

interface UseSpeciesTableProps {
    handleOpenEdit: (species: ISpeciesDetails) => void;
    handleDelete: (species: ISpeciesDetails) => void;
}

/** « 22 – 28 °C », « ≥ 22 °C », « ≤ 28 °C » ou « — » selon les bornes renseignées. */
export function formatRange(min: number | null, max: number | null, unit?: string): string {
    const suffix = unit ? ` ${unit}` : '';
    if (min != null && max != null) return `${min} – ${max}${suffix}`;
    if (min != null) return `≥ ${min}${suffix}`;
    if (max != null) return `≤ ${max}${suffix}`;
    return '—';
}

export const useSpeciesTable = ({
    handleOpenEdit,
    handleDelete,
}: UseSpeciesTableProps): GridColDef<ISpeciesDetails>[] => [
    { field: 'name', headerName: 'Nom', flex: 1, minWidth: 180 },
    {
        field: 'scientificName',
        headerName: 'Nom scientifique',
        flex: 1,
        minWidth: 180,
        valueFormatter: (value: ISpeciesDetails['scientificName']) => value || '—',
    },
    {
        field: 'categories',
        headerName: 'Catégories',
        flex: 1.2,
        minWidth: 200,
        sortable: false,
        valueGetter: (value: ISpeciesDetails['categories']) =>
            value.map((category) => category.name).join(', '),
        renderCell: (params: GridRenderCellParams<ISpeciesDetails>) => (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%', overflow: 'hidden' }}>
                {params.row.categories.map((category) => (
                    <Chip key={category.id} label={category.name} size="small" />
                ))}
            </Box>
        ),
    },
    {
        field: 'waterType',
        headerName: "Type d'eau",
        minWidth: 200,
        valueFormatter: (value: ISpeciesDetails['waterType']) => (value ? WATER_TYPE_LABEL[value] : '—'),
    },
    // Les plages sont triées (côté serveur) sur leur borne minimale.
    {
        field: 'minTemperature',
        headerName: 'Température',
        width: 130,
        valueFormatter: (_value, row) => formatRange(row.minTemperature, row.maxTemperature, '°C'),
    },
    {
        field: 'minPh',
        headerName: 'pH',
        width: 110,
        valueFormatter: (_value, row) => formatRange(row.minPh, row.maxPh),
    },
    {
        field: 'minGh',
        headerName: 'GH',
        width: 110,
        valueFormatter: (_value, row) => formatRange(row.minGh, row.maxGh),
    },
    {
        field: 'minKh',
        headerName: 'KH',
        width: 110,
        valueFormatter: (_value, row) => formatRange(row.minKh, row.maxKh),
    },
    {
        field: 'minVolume',
        headerName: 'Volume min.',
        width: 120,
        valueFormatter: (value: ISpeciesDetails['minVolume']) => (value != null ? `${value} L` : '—'),
    },
    {
        field: 'aggressiveness',
        headerName: 'Agressivité',
        width: 140,
        valueFormatter: (value: ISpeciesDetails['aggressiveness']) =>
            value ? AGGRESSIVENESS_LABEL[value] : '—',
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 250,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<ISpeciesDetails>) => (
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
