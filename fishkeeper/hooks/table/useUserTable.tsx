import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import type { IUser } from '../../interface/entity/user.entity';
import { Avatar, Box, Button } from '@mui/material';

interface UseUserTableProps {
    handleOpenEdit: (user: IUser) => void;
    handleDelete: (id: string) => void;
}

export const useUserTable = ({ handleOpenEdit, handleDelete }: UseUserTableProps): GridColDef<IUser>[] => [
  { field: 'name', headerName: 'Nom', flex: 1, minWidth: 160 },
  { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 220},
  { field: 'role', headerName: 'Rôle', flex: 1, minWidth: 160 },
  {
    field: 'departement',
    headerName: 'Département',
    flex: 1,
    minWidth: 160,
  },
  {
    field: 'imageURL',
    headerName: 'Avatar',
    flex: 1,
    minWidth: 160,
    renderCell: (params: GridRenderCellParams<IUser>) => (
      <Avatar
        src={params.row.imageURL ? String(params.row.imageURL) : undefined}
        alt={params.row.name ?? params.row.email}
        >
          {params.row.name?.charAt(0).toUpperCase() ?? params.row.email.charAt(0).toUpperCase()}
      </Avatar>
    ),
  },
    {
          field: 'actions',
          headerName: 'Actions',
          width: 250,
          sortable: false,
          filterable: false,
          renderCell: (params: GridRenderCellParams<IUser>) => (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenEdit(params.row)}
              >
                Modifier
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDelete(params.row.id)}
              >
                Supprimer
              </Button>
            </Box>
          ),
      },
];