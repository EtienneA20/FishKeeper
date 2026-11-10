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