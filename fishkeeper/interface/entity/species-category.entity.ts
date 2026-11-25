export interface ISpeciesCategory {
    id: string;
    name: string;
    description: string | null;
}

export interface ISpeciesCategoryDetails extends ISpeciesCategory {
    incompatibleCategories: Pick<ISpeciesCategory, 'id' | 'name'>[];
    speciesCount: number;
    exclusiveSpeciesCount: number;
}
