import { describe, expect, it, vi } from 'vitest';

import {
    ActionError,
    runAction,
    unwrapActionResult,
} from '@/lib/action-result';
import { formatCalendarDate, toCalendarDateInput } from '@/lib/format';

describe('runAction', () => {
    it('returns ok when the action succeeds', async () => {
        await expect(runAction(async () => {})).resolves.toEqual({ ok: true });
    });

    it('returns the message of a business error', async () => {
        await expect(
            runAction(async () => {
                throw new ActionError('Espèce introuvable.');
            })
        ).resolves.toEqual({ ok: false, error: 'Espèce introuvable.' });
    });

    it('maps a unique constraint violation to the given message', async () => {
        const uniqueViolation = Object.assign(new Error('raw prisma'), {
            code: 'P2002',
        });
        await expect(
            runAction(
                async () => {
                    throw uniqueViolation;
                },
                { uniqueViolation: 'Nom déjà pris.' }
            )
        ).resolves.toEqual({ ok: false, error: 'Nom déjà pris.' });
    });

    it('hides the message of an unexpected error', async () => {
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        await expect(
            runAction(async () => {
                throw new Error('SQLITE_BUSY: database is locked');
            })
        ).resolves.toEqual({ ok: false, error: 'Une erreur est survenue.' });
        expect(consoleError).toHaveBeenCalled();
        consoleError.mockRestore();
    });

    it('unwraps a failure into an exception on the client', () => {
        expect(() => unwrapActionResult({ ok: true })).not.toThrow();
        expect(() =>
            unwrapActionResult({ ok: false, error: 'Refusé.' })
        ).toThrow('Refusé.');
    });
});

describe('calendar dates', () => {
    it('keeps the same day in the table and in the form, whatever the time', () => {
        const lateEvening = '2026-03-14T23:30:00.000Z';
        expect(formatCalendarDate(lateEvening)).toBe('14/03/2026');
        expect(toCalendarDateInput(lateEvening)).toBe('2026-03-14');
    });
});
