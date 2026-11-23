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
        coverage: {
            provider: 'v8',
            // Server logic only: React components are covered by the Playwright tests,
            // which this report cannot measure.
            include: ['actions/**/*.ts', 'lib/**/*.ts', 'auth.ts'],
            reporter: ['text', 'text-summary', 'html'],
            // `npm run test:coverage` fails below these percentages (CI included).
            thresholds: {
                lines: 75,
                statements: 75,
                functions: 75,
                branches: 75,
            },
        },
    },
});
