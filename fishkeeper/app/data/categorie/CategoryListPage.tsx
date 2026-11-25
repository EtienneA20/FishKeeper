'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusIcon } from 'lucide-react';

import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from '@/actions/category.controller';
import ConfirmDialog from '@/components/utils/ConfirmDialog';
import { ToogleRenderMode } from '@/components/utils/ToogleRenderMode';
import CategoryFormDialog from '@/form/dialog/CategoryFormDialog';
import type { CategoryFormValues } from '@/form/schema/category.schema';
import { useCategoryTable } from '@/hooks/table/useCategoryTable';
import { useCrudDisclosure } from '@/hooks/useCrudDiclosure';
import type { ISpeciesCategoryDetails } from '@/interface/entity/species-category.entity';
import CategoryCard from './CategoryCard';

export default function CategoryListPage(): React.JSX.Element {
	const [categories, setCategories] = useState<ISpeciesCategoryDetails[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [toDelete, setToDelete] = useState<ISpeciesCategoryDetails | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const disclosure = useCrudDisclosure<ISpeciesCategoryDetails>();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [isModeTable, setIsModeTable] = useState<boolean>(true);
	const isTableView = isMobile || isModeTable;

	useEffect(() => {
		let isMounted = true;

		const loadCategories = async (): Promise<void> => {
			try {
				const loadedCategories = await getCategories();
				if (isMounted) {
					setCategories(loadedCategories);
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

		void loadCategories();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleSave = async (
		values: CategoryFormValues,
		data: ISpeciesCategoryDetails | null,
	): Promise<void> => {
		setIsSaving(true);

		try {
			if (data) {
				await updateCategory(data.id, values);
			} else {
				await createCategory(values);
			}
			setCategories(await getCategories());
		} finally {
			setIsSaving(false);
		}
	};

	const handleAskDelete = (category: ISpeciesCategoryDetails): void => {
		setDeleteError(null);
		setToDelete(category);
	};

	const handleCloseDelete = (): void => {
		setToDelete(null);
		setDeleteError(null);
	};

	const handleConfirmDelete = async (): Promise<void> => {
		if (!toDelete) return;
		setIsSaving(true);

		try {
			await deleteCategory(toDelete.id);
			setCategories(await getCategories());
			handleCloseDelete();
		} catch (saveError) {
			setDeleteError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
		} finally {
			setIsSaving(false);
		}
	};

	const columns = useCategoryTable({
		handleOpenEdit: disclosure.openUpdate,
		handleDelete: handleAskDelete,
	});

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Stack spacing={3}>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
					<Box>
						<Typography variant="h4" component="h1">
							Catégories
						</Typography>
						<Typography color="text.secondary">
							Gérez les catégories d&apos;espèces et leurs incompatibilités.
						</Typography>
						{error && <Typography color="error">{error}</Typography>}
					</Box>
					<Button variant="contained" startIcon={<PlusIcon />} onClick={disclosure.openCreate}>
						Ajouter une catégorie
					</Button>
					{!isMobile && <ToogleRenderMode isTableView={isModeTable} onChange={setIsModeTable} />}
				</Stack>

				{isTableView ? (
					<Paper sx={{ height: 520, width: '100%', minWidth: 0, overflow: 'hidden' }}>
						<DataGrid
							rows={categories}
							columns={columns}
							columnVisibilityModel={{
								description: !isMobile,
								incompatibleCategories: !isMobile,
							}}
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
				) : (
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
							gap: 2,
						}}
					>
						{isLoading ? (
							<Typography>Chargement des catégories...</Typography>
						) : categories.length === 0 ? (
							<Typography color="text.secondary">Aucune catégorie trouvée.</Typography>
						) : (
							categories.map((category) => (
								<CategoryCard
									key={category.id}
									category={category}
									onEdit={disclosure.openUpdate}
									onDelete={handleAskDelete}
								/>
							))
						)}
					</Box>
				)}
			</Stack>

			<CategoryFormDialog
				open={disclosure.isOpen}
				data={disclosure.data}
				categories={categories}
				isLoading={isSaving}
				onClose={disclosure.onClose}
				onSave={handleSave}
			/>

			<ConfirmDialog
				open={toDelete !== null}
				title="Supprimer la catégorie ?"
				isLoading={isSaving}
				error={deleteError}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				message={
					toDelete && (
						<>
							La catégorie <strong>{toDelete.name}</strong> va être supprimée.
							{toDelete.exclusiveSpeciesCount === 1 && (
								<> <strong>1 espèce</strong> qui n&apos;appartient qu&apos;à elle sera aussi supprimée.</>
							)}
							{toDelete.exclusiveSpeciesCount > 1 && (
								<>
									{' '}
									<strong>{toDelete.exclusiveSpeciesCount} espèces</strong> qui n&apos;appartiennent
									qu&apos;à elle seront aussi supprimées.
								</>
							)}
							{toDelete.speciesCount > toDelete.exclusiveSpeciesCount && (
								<> Les espèces rattachées à d&apos;autres catégories sont conservées.</>
							)}{' '}
							Cette action est irréversible.
						</>
					)
				}
			/>
		</Container>
	);
}
