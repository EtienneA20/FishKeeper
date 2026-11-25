import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3100';
const projectRoot = __dirname;

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    reporter: 'list',
    // `next dev` compiles each route on its first visit, which can take several seconds.
    expect: { timeout: 15_000 },
    use: {
        baseURL,
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command:
            'npm run test:e2e:prepare && npm run dev -- --hostname 127.0.0.1 --port 3100',
        cwd: projectRoot,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180_000,
        env: {
            DATABASE_URL: `file:${join(projectRoot, 'e2e.db')}`,
            NEXTAUTH_SECRET: 'fishkeeper-e2e-only-secret',
            NEXTAUTH_URL: baseURL,
        },
    },
});
