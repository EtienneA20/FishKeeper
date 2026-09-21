'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import UserFormDialog from '../../form/dialog/UserFormDialog';
import { useCrudDisclosure } from '../../hooks/useCrudDiclosure';
import { useUserTable } from '../../hooks/table/useUserTable';
import type { UserFormValues } from '../../form/schema/user.schema';
import type { IUser } from '../../interface/entity/user.entity';
import { PlusIcon } from 'lucide-react';

export default function UserListPage(): React.JSX.Element {
	const [users, setUsers] = useState<IUser[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const disclosure = useCrudDisclosure<IUser>();

	useEffect(() => {
		const loadUsers = async (): Promise<void> => {
			try {
				const response = await fetch('/api/users');
				if (!response.ok) throw new Error('Impossible de charger les utilisateurs.');
				setUsers((await response.json()) as IUser[]);
			} catch (loadError) {
				setError(loadError instanceof Error ? loadError.message : 'Une erreur est survenue.');
			} finally {
				setIsLoading(false);
			}
		};

		void loadUsers();
	}, []);

	const handleSave = async (
		values: UserFormValues,
		currentUser: IUser | null,
	): Promise<void> => {
		setIsSaving(true);

		try {
			const response = await fetch('/api/users', {
				method: currentUser ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(currentUser ? { id: currentUser.id, ...values } : values),
			});

			if (!response.ok) throw new Error('Impossible d’enregistrer cet utilisateur.');

			const savedUser = (await response.json()) as IUser;
			setUsers((currentUsers) =>
				currentUser
					? currentUsers.map((user) => user.id === savedUser.id ? savedUser : user)
					: [...currentUsers, savedUser],
			);
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
			throw saveError;
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async (id: string): Promise<void> => {
		const response = await fetch('/api/users', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id }),
		});

		if (!response.ok) {
			setError('Impossible de supprimer cet utilisateur.');
			return;
		}

		setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
	};

	const columns = useUserTable({
		handleOpenEdit: disclosure.openUpdate,
		handleDelete,
	});

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Stack spacing={3} >
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={2}
				>
					<Box>
						<Typography variant="h4" component="h1">
							Utilisateurs
						</Typography>
						<Typography color="text.secondary">
							Gérez les utilisateurs de Fishkeeper.
						</Typography>
						{error && <Typography color="error">{error}</Typography>}
					</Box>
					<Button
						variant="contained"
						startIcon={<PlusIcon/>}
						onClick={disclosure.openCreate}
					>
						Ajouter un utilisateur
					</Button>
				</Stack>

				<Paper sx={{ height: 520, width: '100%' }}>
					<DataGrid
						rows={users}
						columns={columns}
						loading={isLoading}
						disableRowSelectionOnClick
						pageSizeOptions={[5, 10, 25]}
						initialState={{
							pagination: {
								paginationModel: { pageSize: 10, page: 0 },
							},
						}}
					/>
				</Paper>
			</Stack>

			<UserFormDialog
				open={disclosure.isOpen}
				data={disclosure.data}
				isLoading={isSaving}
				onClose={disclosure.onClose}
				onSave={handleSave}
			/>
		</Container>
	);
}
