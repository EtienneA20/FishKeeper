/**
 * Ne garde que les chiffres et un seul séparateur décimal (« , » ou « . »),
 * tronque les décimales au-delà de la limite.
 */
export function sanitizeDecimalInput(raw: string, decimals: number): string {
    const cleaned = raw.replace(/[^\d.,]/g, '');
    const separatorIndex = cleaned.search(/[.,]/);
    if (separatorIndex === -1 || decimals === 0) {
        return cleaned.replace(/[.,]/g, '');
    }

    const integerPart = cleaned.slice(0, separatorIndex) || '0';
    const decimalPart = cleaned
        .slice(separatorIndex + 1)
        .replace(/[.,]/g, '')
        .slice(0, decimals);
    return `${integerPart}${cleaned[separatorIndex]}${decimalPart}`;
}

/** `''` → `undefined` (champ vide) ; sinon un nombre (« 7,5 » → 7.5). */
export function parseDecimalInput(text: string): number | undefined {
    return text === '' ? undefined : Number(text.replace(',', '.'));
}

/** Valeur numérique → texte affiché, avec la virgule française. */
export function formatDecimalInput(value: number | null | undefined): string {
    return value == null || Number.isNaN(value) ? '' : String(value).replace('.', ',');
}
