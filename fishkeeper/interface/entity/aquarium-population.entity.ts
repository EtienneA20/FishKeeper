export interface IAquariumPopulation {
    id: string;
    name: string | null;
    introducedAt: Date;
    notes: string | null;
    size: number | null;
    weight: number | null;
    imageURL: string | null;
    aquariumId: string;
    speciesId: string;
}

export interface IPopulationAquariumOption {
    id: string;
    name: string;
    ownerName: string;
}

export interface IAquariumPopulationDetails extends IAquariumPopulation {
    aquarium: IPopulationAquariumOption;
    species: { id: string; name: string; scientificName: string | null };
}
