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
import { createUser, deleteUser, getUsers, updateUser } from '@/actions/user.controller';
import UserMenuPopover from '@/components/UserMenuPopover';

export default function UserListPage(): React.JSX.Element {
	const [users, setUsers] = useState<IUser[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [openUserState, setOpenUserState] = useState(false);

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const disclosure = useCrudDisclosure<IUser>();

	useEffect(() => {
		let isMounted = true;

		const loadUsers = async (): Promise<void> => {
			try {
				const loadedUsers = await getUsers();
				if (isMounted) {
					setUsers(loadedUsers);
				}
			} catch (loadError) {
				if (isMounted) {
					setError(loadError instanceof Error ? loadError.message : 'Une erreur est survenue.');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadUsers();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleSave = async (
		values: UserFormValues,
		data: IUser | null,
	): Promise<void> => {
		setIsSaving(true);

		try {
			if (data) {
				await updateUser(data.id, values);
			} else {
				await createUser(values);
			}
			setUsers(await getUsers());
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
			throw saveError;
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async (id: string): Promise<void> => {
		setIsSaving(true);

		try {
			await deleteUser(id);
			setUsers(await getUsers());
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
			throw saveError;
		} finally {
			setIsSaving(false);
		}
	};

	const columns = useUserTable({
		handleOpenEdit: disclosure.openUpdate,
		handleDelete,
	});

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Stack spacing={3} >
				<UserMenuPopover />
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
