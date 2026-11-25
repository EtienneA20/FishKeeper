import { EAggressiveness } from '@/constants/enum/aggressiveness.enum';
import { EWaterType } from '@/constants/enum/water-type.enum';
import type { ISpeciesCategory } from './species-category.entity';

// interface des especes
export interface ISpecies {
    id: string;
    name: string;
    scientificName: string | null;
    categoryIds: string[];
    description: string | null;
    imageURL: string | null;
    waterType: EWaterType | null;
    minTemperature: number | null;
    maxTemperature: number | null;
    minPh: number | null;
    maxPh: number | null;
    minGh: number | null;
    maxGh: number | null;
    minKh: number | null;
    maxKh: number | null;
    minVolume: number | null;
    aggressiveness: EAggressiveness | null;
}

export interface ISpeciesDetails extends ISpecies {
    categories: Pick<ISpeciesCategory, 'id' | 'name'>[];
    /** Nombre d'individus de l'espèce présents en aquarium (bloque la suppression). */
    populationCount: number;
}

export type ISpeciesOption = Pick<ISpecies, 'id' | 'name' | 'scientificName'>;

/** Champs sur lesquels la liste des espèces peut être triée côté serveur. */
export const SPECIES_SORT_FIELDS = [
    'name',
    'scientificName',
    'waterType',
    'minTemperature',
    'minPh',
    'minGh',
    'minKh',
    'minVolume',
    'aggressiveness',
] as const;

export type SpeciesSortField = (typeof SPECIES_SORT_FIELDS)[number];

export interface ISpeciesQuery {
    page: number;
    pageSize: number;
    search?: string;
    sortField?: SpeciesSortField;
    sortOrder?: 'asc' | 'desc';
}

export interface ISpeciesPage {
    rows: ISpeciesDetails[];
    total: number;
}
