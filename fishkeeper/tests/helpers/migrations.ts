import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const projectRoot = resolve(__dirname, '..', '..');
const prismaCli = join(
    projectRoot,
    'node_modules',
    'prisma',
    'build',
    'index.js'
);

export function toDatabaseUrl(databasePath: string): string {
    return `file:${databasePath}`;
}

/**
 * Recreates a SQLite file by applying every SQL migration with `prisma migrate deploy`.
 * `prisma db push` must not be used for tests: it ignores the hand-written CHECK
 * constraints that only exist in the migration files.
 */
export function createDatabaseFromMigrations(databasePath: string): void {
    for (const suffix of ['', '-journal', '-wal', '-shm']) {
        rmSync(`${databasePath}${suffix}`, { force: true });
    }

    try {
        execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
            cwd: projectRoot,
            env: { ...process.env, DATABASE_URL: toDatabaseUrl(databasePath) },
            stdio: 'pipe',
        });
    } catch (error) {
        const { stdout, stderr } = error as {
            stdout?: Buffer;
            stderr?: Buffer;
        };
        throw new Error(
            `prisma migrate deploy failed for ${databasePath}:\n${stdout ?? ''}${stderr ?? ''}`
        );
    }
}
