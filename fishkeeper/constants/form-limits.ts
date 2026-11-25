/**
 * Bornes partagées par les formulaires (yup) et les DTO serveur (class-validator).
 * Les valeurs couvrent le jeu de données (data/05_final_seed.json) avec de la marge.
 */

export interface NumberLimit {
    min: number;
    max: number;
    /** Nombre maximal de décimales acceptées à la saisie. */
    decimals: number;
}

export const SPECIES_LIMITS = {
    temperature: { min: 0, max: 45, decimals: 1 },
    ph: { min: 0, max: 14, decimals: 2 },
    gh: { min: 0, max: 50, decimals: 1 },
    kh: { min: 0, max: 50, decimals: 1 },
    volume: { min: 1, max: 200_000, decimals: 0 },
} as const satisfies Record<string, NumberLimit>;

export const POPULATION_LIMITS = {
    size: { min: 0, max: 500, decimals: 1 }, // cm
    weight: { min: 0, max: 100_000, decimals: 1 }, // g
} as const satisfies Record<string, NumberLimit>;

export const TEXT_LIMITS = {
    name: 120,
    scientificName: 150,
    description: 10_000,
    notes: 2_000,
    url: 2_048,
} as const;

/** Bornes de la date d'introduction d'un individu. */
export const POPULATION_MIN_DATE = '1900-01-01';
