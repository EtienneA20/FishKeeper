import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('.', import.meta.url)),
        },
    },
    test: {
        include: ['tests/{unit,models,integration}/**/*.test.ts'],
        environment: 'node',
        // Builds a SQLite database from prisma/migrations once per run,
        // then gives every test file its own copy of it.
        globalSetup: ['tests/setup/global-setup.ts'],
        setupFiles: ['tests/setup/database.ts'],
        clearMocks: true,
        restoreMocks: true,
    },
});
