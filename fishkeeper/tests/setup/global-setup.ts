import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TestProject } from 'vitest/node';

import { createDatabaseFromMigrations } from '../helpers/migrations';

declare module 'vitest' {
    export interface ProvidedContext {
        templateDatabasePath: string;
    }
}

/** Migrates one template database per run; each test file then works on its own copy. */
export default function setup(project: TestProject): () => void {
    const directory = mkdtempSync(join(tmpdir(), 'fishkeeper-tests-'));
    const templateDatabasePath = join(directory, 'template.db');

    createDatabaseFromMigrations(templateDatabasePath);
    project.provide('templateDatabasePath', templateDatabasePath);

    return () => rmSync(directory, { recursive: true, force: true });
}
