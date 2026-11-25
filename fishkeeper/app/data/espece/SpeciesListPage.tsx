'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TablePagination,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    DataGrid,
    type GridPaginationModel,
    type GridSortModel,
} from '@mui/x-data-grid';
import { PlusIcon } from 'lucide-react';

import { getCategoryOptions } from '@/actions/category.controller';
import {
    createSpecies,
    deleteSpecies,
    getSpecies,
    updateSpecies,
} from '@/actions/species.controller';
import ConfirmDialog from '@/components/utils/ConfirmDialog';
import { ToogleRenderMode } from '@/components/utils/ToogleRenderMode';
import SpeciesFormDialog from '@/form/dialog/SpeciesFormDialog';
import type { SpeciesFormValues } from '@/form/schema/species.schema';
import { useSpeciesTable } from '@/hooks/table/useSpeciesTable';
import { useCrudDisclosure } from '@/hooks/useCrudDiclosure';
import type { ISpeciesCategory } from '@/interface/entity/species-category.entity';
import {
    SPECIES_SORT_FIELDS,
    type ISpeciesDetails,
    type ISpeciesQuery,
    type SpeciesSortField,
} from '@/interface/entity/species.entity';
import { unwrapActionResult } from '@/lib/action-result';
import SpeciesCard from './SpeciesCard';

const SEARCH_DELAY_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function SpeciesListPage(): React.JSX.Element {
    const [species, setSpecies] = useState<ISpeciesDetails[]>([]);
    const [total, setTotal] = useState(0);
    const [categoryOptions, setCategoryOptions] = useState<
        Pick<ISpeciesCategory, 'id' | 'name'>[]
    >([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Séparée de `error` : un rechargement réussi des espèces ne doit pas l'effacer.
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<ISpeciesDetails | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const disclosure = useCrudDisclosure<ISpeciesDetails>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isModeTable, setIsModeTable] = useState<boolean>(true);
    const isTableView = isMobile || isModeTable;

    // Pagination, tri et recherche sont faits côté serveur : la base contient trop d'espèces.
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(
        { page: 0, pageSize: 10 }
    );
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: 'name', sort: 'asc' },
    ]);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const nextSearch = searchInput.trim();
        if (nextSearch === search) return;

        const timeout = setTimeout(() => {
            setSearch(nextSearch);
            setPaginationModel((model) => ({ ...model, page: 0 }));
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timeout);
    }, [searchInput, search]);

    const query = useMemo<ISpeciesQuery>(() => {
        const sort = sortModel[0];
        const sortField = SPECIES_SORT_FIELDS.find(
            (field) => field === sort?.field
        ) as SpeciesSortField | undefined;
        return {
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
            search,
            sortField,
            sortOrder: sort?.sort === 'desc' ? 'desc' : 'asc',
        };
    }, [paginationModel, sortModel, search]);

    useEffect(() => {
        let isMounted = true;

        const loadSpecies = async (): Promise<void> => {
            setIsLoading(true);
            try {
                const result = await getSpecies(query);
                if (isMounted) {
                    setSpecies(result.rows);
                    setTotal(result.total);
                    setError(null);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : 'Une erreur est survenue.'
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadSpecies();

        return () => {
            isMounted = false;
        };
    }, [query, reloadKey]);

    useEffect(() => {
        getCategoryOptions()
            .then(setCategoryOptions)
            .catch((loadError) =>
                setCategoryError(
                    loadError instanceof Error
                        ? loadError.message
                        : 'Une erreur est survenue.'
                )
            );
    }, []);

    const reload = (): void => setReloadKey((key) => key + 1);

    const handleSave = async (
        values: SpeciesFormValues,
        data: ISpeciesDetails | null
    ): Promise<void> => {
        setIsSaving(true);

        try {
            // Un échec est relevé en exception : le dialogue l'affiche et reste ouvert.
            unwrapActionResult(
                data
                    ? await updateSpecies(data.id, values)
                    : await createSpecies(values)
            );
            reload();
        } finally {
            setIsSaving(false);
        }
    };

    const handleAskDelete = (item: ISpeciesDetails): void => {
        setDeleteError(null);
        setToDelete(item);
    };

    const handleCloseDelete = (): void => {
        setToDelete(null);
        setDeleteError(null);
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (!toDelete) return;
        setIsSaving(true);

        try {
            unwrapActionResult(await deleteSpecies(toDelete.id));
            reload();
            handleCloseDelete();
        } catch (saveError) {
            setDeleteError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Une erreur est survenue.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const columns = useSpeciesTable({
        handleOpenEdit: disclosure.openUpdate,
        handleDelete: handleAskDelete,
    });

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" component="h1">
                            Espèces
                        </Typography>
                        <Typography color="text.secondary">
                            Référencez les espèces et leurs paramètres de
                            maintenance.
                        </Typography>
                        {[error, categoryError]
                            .filter(Boolean)
                            .map((message) => (
                                <Typography key={message} color="error">
                                    {message}
                                </Typography>
                            ))}
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<PlusIcon />}
                        onClick={disclosure.openCreate}
                    >
                        Ajouter une espèce
                    </Button>
                    {!isMobile && (
                        <ToogleRenderMode
                            isTableView={isModeTable}
                            onChange={setIsModeTable}
                        />
                    )}
                </Stack>

                <TextField
                    label="Rechercher (nom ou nom scientifique)"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    size="small"
                    sx={{ maxWidth: 420 }}
                />

                {isTableView ? (
                    <Paper
                        sx={{
                            height: 620,
                            width: '100%',
                            minWidth: 0,
                            overflow: 'hidden',
                        }}
                    >
                        <DataGrid
                            rows={species}
                            columns={columns}
                            rowCount={total}
                            columnVisibilityModel={{
                                scientificName: !isMobile,
                                categories: !isMobile,
                                waterType: !isMobile,
                                minTemperature: !isMobile,
                                minPh: !isMobile,
                                minGh: !isMobile,
                                minKh: !isMobile,
                                minVolume: !isMobile,
                                aggressiveness: !isMobile,
                            }}
                            loading={isLoading}
                            disableRowSelectionOnClick
                            disableColumnFilter
                            paginationMode="server"
                            sortingMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            sortModel={sortModel}
                            onSortModelChange={(model) => {
                                setSortModel(model);
                                setPaginationModel((current) => ({
                                    ...current,
                                    page: 0,
                                }));
                            }}
                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                        />
                    </Paper>
                ) : (
                    <Stack spacing={2}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: 2,
                            }}
                        >
                            {isLoading ? (
                                <Typography>
                                    Chargement des espèces...
                                </Typography>
                            ) : species.length === 0 ? (
                                <Typography color="text.secondary">
                                    Aucune espèce trouvée.
                                </Typography>
                            ) : (
                                species.map((item) => (
                                    <SpeciesCard
                                        key={item.id}
                                        species={item}
                                        onEdit={disclosure.openUpdate}
                                        onDelete={handleAskDelete}
                                    />
                                ))
                            )}
                        </Box>
                        <TablePagination
                            component="div"
                            count={total}
                            page={paginationModel.page}
                            rowsPerPage={paginationModel.pageSize}
                            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                            labelRowsPerPage="Espèces par page"
                            onPageChange={(_event, page) =>
                                setPaginationModel((model) => ({
                                    ...model,
                                    page,
                                }))
                            }
                            onRowsPerPageChange={(event) =>
                                setPaginationModel({
                                    page: 0,
                                    pageSize: Number(event.target.value),
                                })
                            }
                        />
                    </Stack>
                )}
            </Stack>

            <SpeciesFormDialog
                open={disclosure.isOpen}
                data={disclosure.data}
                categoryOptions={categoryOptions}
                isLoading={isSaving}
                onClose={disclosure.onClose}
                onSave={handleSave}
            />

            <ConfirmDialog
                open={toDelete !== null}
                title="Supprimer l'espèce ?"
                isLoading={isSaving}
                error={deleteError}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                message={
                    toDelete && (
                        <>
                            L&apos;espèce <strong>{toDelete.name}</strong> va
                            être supprimée.
                            {toDelete.populationCount > 0 && (
                                <>
                                    {' '}
                                    Elle est présente dans{' '}
                                    <strong>
                                        {toDelete.populationCount} aquarium
                                        {toDelete.populationCount > 1
                                            ? 's'
                                            : ''}
                                    </strong>{' '}
                                    : la suppression sera refusée tant
                                    qu&apos;elle y figure.
                                </>
                            )}{' '}
                            Cette action est irréversible.
                        </>
                    )
                }
            />
        </Container>
    );
}
