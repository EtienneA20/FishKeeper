export enum EAggressiveness {
    PEACEFUL = 'PEACEFUL',
    SEMI_AGGRESSIVE = 'SEMI_AGGRESSIVE',
    AGGRESSIVE = 'AGGRESSIVE',
    TERRITORIAL = 'TERRITORIAL',
}

export const AGGRESSIVENESS_LABEL: Record<EAggressiveness, string> = {
    [EAggressiveness.PEACEFUL]: 'Paisible',
    [EAggressiveness.SEMI_AGGRESSIVE]: 'Semi-agressif',
    [EAggressiveness.AGGRESSIVE]: 'Agressif',
    [EAggressiveness.TERRITORIAL]: 'Territorial',
};
