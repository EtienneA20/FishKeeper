import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import RowActions from '@/components/utils/RowActions';
import type { IAquariumPopulationDetails } from '@/interface/entity/aquarium-population.entity';
import { formatCalendarDate, formatWithUnit } from '@/lib/format';

interface UsePopulationTableProps {
    handleOpenEdit: (population: IAquariumPopulationDetails) => void;
    handleDelete: (population: IAquariumPopulationDetails) => void;
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
        valueFormatter: (value: IAquariumPopulationDetails['name']) =>
            value || '—',
    },
    {
        field: 'species',
        headerName: 'Espèce',
        flex: 1,
        minWidth: 180,
        valueGetter: (value: IAquariumPopulationDetails['species']) =>
            value.name,
    },
    {
        field: 'aquarium',
        headerName: 'Aquarium',
        flex: 1,
        minWidth: 160,
        valueGetter: (value: IAquariumPopulationDetails['aquarium']) =>
            value.name,
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
        valueGetter: (value: IAquariumPopulationDetails['introducedAt']) =>
            new Date(value),
        valueFormatter: (value: Date) => formatCalendarDate(value),
    },
    {
        field: 'size',
        headerName: 'Taille',
        type: 'number',
        width: 100,
        valueFormatter: (value: IAquariumPopulationDetails['size']) =>
            formatWithUnit(value, 'cm'),
    },
    {
        field: 'weight',
        headerName: 'Poids',
        type: 'number',
        width: 100,
        valueFormatter: (value: IAquariumPopulationDetails['weight']) =>
            formatWithUnit(value, 'g'),
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 250,
        sortable: false,
        filterable: false,
        renderCell: (
            params: GridRenderCellParams<IAquariumPopulationDetails>
        ) => (
            <RowActions
                sx={{ height: '100%' }}
                onEdit={() => handleOpenEdit(params.row)}
                onDelete={() => handleDelete(params.row)}
            />
        ),
    },
];
