import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '..', '..');

describe('Prisma migrations', () => {
    it('match prisma/schema.prisma (no change is missing a migration)', () => {
        const run = (): string =>
            execFileSync(
                process.execPath,
                [
                    join(
                        projectRoot,
                        'node_modules',
                        'prisma',
                        'build',
                        'index.js'
                    ),
                    'migrate',
                    'diff',
                    '--from-migrations',
                    'prisma/migrations',
                    '--to-schema',
                    'prisma/schema.prisma',
                    '--exit-code',
                ],
                { cwd: projectRoot, encoding: 'utf8', stdio: 'pipe' }
            );

        // --exit-code makes the command fail (exit 2) when the two differ.
        expect(run).not.toThrow();
    }, 60_000);
});
