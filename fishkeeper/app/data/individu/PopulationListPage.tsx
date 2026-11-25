'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusIcon } from 'lucide-react';

import {
	createPopulation,
	deletePopulation,
	getPopulationAquariumOptions,
	getPopulations,
	updatePopulation,
} from '@/actions/population.controller';
import ConfirmDialog from '@/components/utils/ConfirmDialog';
import { ToogleRenderMode } from '@/components/utils/ToogleRenderMode';
import PopulationFormDialog from '@/form/dialog/PopulationFormDialog';
import type { PopulationFormValues } from '@/form/schema/population.schema';
import { usePopulationTable } from '@/hooks/table/usePopulationTable';
import { useCrudDisclosure } from '@/hooks/useCrudDiclosure';
import type {
	IAquariumPopulationDetails,
	IPopulationAquariumOption,
} from '@/interface/entity/aquarium-population.entity';
import PopulationCard from './PopulationCard';

export default function PopulationListPage(): React.JSX.Element {
	const [populations, setPopulations] = useState<IAquariumPopulationDetails[]>([]);
	const [aquariumOptions, setAquariumOptions] = useState<IPopulationAquariumOption[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [toDelete, setToDelete] = useState<IAquariumPopulationDetails | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const disclosure = useCrudDisclosure<IAquariumPopulationDetails>();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [isModeTable, setIsModeTable] = useState<boolean>(true);
	const isTableView = isMobile || isModeTable;

	useEffect(() => {
		let isMounted = true;

		const loadPopulations = async (): Promise<void> => {
			try {
				const [loadedPopulations, loadedAquariums] = await Promise.all([
					getPopulations(),
					getPopulationAquariumOptions(),
				]);
				if (isMounted) {
					setPopulations(loadedPopulations);
					setAquariumOptions(loadedAquariums);
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

		void loadPopulations();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleSave = async (
		values: PopulationFormValues,
		data: IAquariumPopulationDetails | null,
	): Promise<void> => {
		setIsSaving(true);

		try {
			if (data) {
				await updatePopulation(data.id, values);
			} else {
				await createPopulation(values);
			}
			setPopulations(await getPopulations());
		} finally {
			setIsSaving(false);
		}
	};

	const handleAskDelete = (population: IAquariumPopulationDetails): void => {
		setDeleteError(null);
		setToDelete(population);
	};

	const handleCloseDelete = (): void => {
		setToDelete(null);
		setDeleteError(null);
	};

	const handleConfirmDelete = async (): Promise<void> => {
		if (!toDelete) return;
		setIsSaving(true);

		try {
			await deletePopulation(toDelete.id);
			setPopulations(await getPopulations());
			handleCloseDelete();
		} catch (saveError) {
			setDeleteError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.');
		} finally {
			setIsSaving(false);
		}
	};

	const columns = usePopulationTable({
		handleOpenEdit: disclosure.openUpdate,
		handleDelete: handleAskDelete,
	});

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Stack spacing={3}>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
					<Box>
						<Typography variant="h4" component="h1">
							Individus
						</Typography>
						<Typography color="text.secondary">
							Gérez les individus présents dans les aquariums.
						</Typography>
						{error && <Typography color="error">{error}</Typography>}
					</Box>
					<Button variant="contained" startIcon={<PlusIcon />} onClick={disclosure.openCreate}>
						Ajouter un individu
					</Button>
					{!isMobile && <ToogleRenderMode isTableView={isModeTable} onChange={setIsModeTable} />}
				</Stack>

				{isTableView ? (
					<Paper sx={{ height: 520, width: '100%', minWidth: 0, overflow: 'hidden' }}>
						<DataGrid
							rows={populations}
							columns={columns}
							columnVisibilityModel={{
								owner: !isMobile,
								introducedAt: !isMobile,
								size: !isMobile,
								weight: !isMobile,
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
							<Typography>Chargement des individus...</Typography>
						) : populations.length === 0 ? (
							<Typography color="text.secondary">Aucun individu trouvé.</Typography>
						) : (
							populations.map((population) => (
								<PopulationCard
									key={population.id}
									population={population}
									onEdit={disclosure.openUpdate}
									onDelete={handleAskDelete}
								/>
							))
						)}
					</Box>
				)}
			</Stack>

			<PopulationFormDialog
				open={disclosure.isOpen}
				data={disclosure.data}
				aquariumOptions={aquariumOptions}
				isLoading={isSaving}
				onClose={disclosure.onClose}
				onSave={handleSave}
			/>

			<ConfirmDialog
				open={toDelete !== null}
				title="Supprimer l'individu ?"
				isLoading={isSaving}
				error={deleteError}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				message={
					toDelete && (
						<>
							L&apos;individu <strong>{toDelete.name || toDelete.species.name}</strong> va être retiré
							de l&apos;aquarium <strong>{toDelete.aquarium.name}</strong>. Cette action est
							irréversible.
						</>
					)
				}
			/>
		</Container>
	);
}
