import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import type { IUser } from '../../interface/entity/user.entity';
import { Box, Button } from '@mui/material';

interface UseUserTableProps {
    handleOpenEdit: (user: IUser) => void;
    handleDelete: (id: string) => void;
}

export const useUserTable = ({ handleOpenEdit, handleDelete }: UseUserTableProps): GridColDef<IUser>[] => [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 160 },
    { field: 'name', headerName: 'Nom', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 220},
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
    },];