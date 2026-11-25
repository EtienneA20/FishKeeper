import { Button, Stack, type StackProps } from '@mui/material';

interface RowActionsProps extends Omit<StackProps, 'children'> {
    onEdit: () => void;
    onDelete: () => void;
}

/** Boutons « Modifier » / « Supprimer » d'une ligne de tableau ou d'une carte. */
export default function RowActions({
    onEdit,
    onDelete,
    sx,
    ...props
}: RowActionsProps): React.JSX.Element {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={[{ alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
            {...props}
        >
            <Button variant="outlined" size="small" onClick={onEdit}>
                Modifier
            </Button>
            <Button
                variant="contained"
                color="error"
                size="small"
                onClick={onDelete}
            >
                Supprimer
            </Button>
        </Stack>
    );
}
