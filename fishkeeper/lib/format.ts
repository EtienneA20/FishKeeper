/** « 22 – 28 °C », « ≥ 22 °C », « ≤ 28 °C » ou « — » selon les bornes renseignées. */
export function formatRange(
    min: number | null,
    max: number | null,
    unit?: string
): string {
    const suffix = unit ? ` ${unit}` : '';
    if (min != null && max != null) return `${min} – ${max}${suffix}`;
    if (min != null) return `≥ ${min}${suffix}`;
    if (max != null) return `≤ ${max}${suffix}`;
    return '—';
}

/** Valeur suivie de son unité, ou « — » si absente. */
export function formatWithUnit(
    value: number | null | undefined,
    unit: string
): string {
    return value != null ? `${value} ${unit}` : '—';
}

/**
 * Les dates d'introduction sont des dates calendaires stockées à minuit UTC :
 * elles sont affichées en UTC pour ne pas changer de jour selon le fuseau.
 */
export function formatCalendarDate(value: Date | string): string {
    return new Date(value).toLocaleDateString('fr-FR', { timeZone: 'UTC' });
}

/** Date calendaire (UTC) au format AAAA-MM-JJ d'un champ date HTML. */
export function toCalendarDateInput(value: Date | string): string {
    return new Date(value).toISOString().slice(0, 10);
}
