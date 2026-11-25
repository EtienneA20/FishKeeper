import { describe, expect, it } from 'vitest';

import { populationSchema } from '@/form/schema/population.schema';
import { speciesSchema } from '@/form/schema/species.schema';
import { formatDecimalInput, parseDecimalInput, sanitizeDecimalInput } from '@/lib/decimal-input';

const CATEGORY_ID = '00000000-0000-4000-8000-000000000001';

describe('sanitizeDecimalInput', () => {
    it.each([
        ['aa', 1, ''],
        ['12abc', 1, '12'],
        ['-5', 1, '5'],
        ['1e5', 1, '15'],
        ['7,55', 1, '7,5'],
        ['7.5.3', 2, '7.53'],
        [',5', 2, '0,5'],
        ['12.7', 0, '127'],
        ['6,', 2, '6,'],
    ])('%s with %i decimals → %s', (raw, decimals, expected) => {
        expect(sanitizeDecimalInput(raw, decimals)).toBe(expected);
    });

    it('parses and formats French decimals', () => {
        expect(parseDecimalInput('')).toBeUndefined();
        expect(parseDecimalInput('7,5')).toBe(7.5);
        expect(parseDecimalInput('6,')).toBe(6);
        expect(formatDecimalInput(7.5)).toBe('7,5');
        expect(formatDecimalInput(undefined)).toBe('');
        expect(formatDecimalInput(Number.NaN)).toBe('');
    });
});

describe('speciesSchema', () => {
    const valid = { name: 'Néon', categoryIds: [CATEGORY_ID] };

    it('accepts empty optional numbers', async () => {
        const result = await speciesSchema.validate({ ...valid, minPh: '' });
        expect(result.minPh).toBeUndefined();
    });

    it.each([
        [{ minPh: Number.NaN }, 'Veuillez saisir un nombre valide.'],
        [{ minPh: 15 }, 'La valeur doit être comprise entre 0 et 14.'],
        [{ minTemperature: -1 }, 'La valeur doit être comprise entre 0 et 45.'],
        [{ minPh: 7.123 }, '2 décimales maximum.'],
        [{ minVolume: 10.5 }, 'Veuillez saisir un nombre entier.'],
        [{ minPh: 8, maxPh: 6 }, 'Le maximum doit être supérieur ou égal au minimum.'],
        [{ name: 'x'.repeat(121) }, '120 caractères maximum.'],
        [{ imageURL: 'javascript:alert(1)' }, "L'URL de l'image est invalide."],
        [{ waterType: 'LAVA' }, "Le type d'eau est invalide."],
    ])('refuses %o', async (overrides, message) => {
        await expect(speciesSchema.validate({ ...valid, ...overrides })).rejects.toThrow(message);
    });
});

describe('populationSchema', () => {
    const valid = { aquariumId: 'a', speciesId: 's', introducedAt: '2026-01-15' };

    it('accepts a valid population', async () => {
        await expect(populationSchema.validate({ ...valid, size: 3.5 })).resolves.toBeTruthy();
    });

    it.each([
        [{ introducedAt: '3000-01-01' }, 'ne peut pas être dans le futur'],
        [{ introducedAt: '1800-01-01' }, 'ne peut pas être dans le futur'],
        [{ introducedAt: 'hier' }, "La date d'introduction est invalide."],
        [{ size: 501 }, 'La valeur doit être comprise entre 0 et 500.'],
        [{ weight: Number.NaN }, 'Veuillez saisir un nombre valide.'],
        [{ notes: 'x'.repeat(2001) }, '2000 caractères maximum.'],
    ])('refuses %o', async (overrides, message) => {
        await expect(populationSchema.validate({ ...valid, ...overrides })).rejects.toThrow(message);
    });
});
