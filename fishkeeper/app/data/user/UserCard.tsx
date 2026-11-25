'use client';

import { IUser } from '@/interface/entity/user.entity';
import { EROLE_LABEL } from '@/constants/enum/role.enum';
import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';


interface UserCardProps {
    user: IUser;
    onEdit: (user: IUser) => void;
    onDelete: (id: string) => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

export default function UserCard({ user, onEdit, onDelete, canEdit = true, canDelete = true }: UserCardProps): React.JSX.Element {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <Avatar
                            src={user.imageURL ? String(user.imageURL) : undefined}
                            alt={user.name ?? user.email}
                        >
                            {user.name?.charAt(0).toUpperCase() ?? user.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" noWrap>
                                {user.name || 'Sans nom'}
                            </Typography>
                            <Typography color="text.secondary" noWrap>
                                {user.email}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack spacing={0.5}>
                        <Typography variant="body2">Rôle : {EROLE_LABEL[user.role] ?? user.role}</Typography>
                        <Typography variant="body2">Département : {user.departement || 'Non renseigné'}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small" disabled={!canEdit} onClick={() => onEdit(user)}>
                            Modifier
                        </Button>
                        <Button variant="contained" color="error" size="small" disabled={!canDelete} onClick={() => onDelete(user.id)}>
                            Supprimer
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
