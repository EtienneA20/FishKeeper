import { expect, test, type Locator, type Page } from '@playwright/test';

// Accounts created by scripts/seed-e2e-users.ts.
const PASSWORD = 'Fishkeeper-test-123!';
const USER = 'user@example.test';
const ADMIN = 'admin@example.test';
const SUDO = 'sudo@example.test';

// User management now lives under /data (see app/data/user).
const USERS_PAGE = '/data/user';

async function openLoginPage(page: Page): Promise<void> {
    // Once React has loaded, next-auth checks the session (twice in dev, StrictMode) and
    // each answer sets a new CSRF cookie. Logging in while one is still pending makes
    // next-auth silently reject the login, so wait for the first answer, then for the rest.
    const sessionChecked = page.waitForResponse((response) =>
        response.url().endsWith('/api/auth/session')
    );
    await page.goto('/login');
    await sessionChecked;
    await page.waitForLoadState('networkidle');
}

/** Logs in and waits for the redirect to the dashboard. */
async function logIn(page: Page, email: string): Promise<void> {
    await openLoginPage(page);
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Mot de passe').fill(PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/127\.0\.0\.1:3100\/$/);
}

async function openUsersPage(page: Page): Promise<void> {
    await page.goto(USERS_PAGE);
    await expect(
        page.getByRole('heading', { name: 'Utilisateurs' })
    ).toBeVisible();
}

/** Sidebar link to /data (labels are hidden while the sidebar is collapsed). */
function dataLink(page: Page): Locator {
    return page.locator('a[href="/data"]');
}

function accountRow(page: Page, email: string): Locator {
    return page.getByRole('row').filter({ hasText: email });
}

async function expectRowActions(
    page: Page,
    email: string,
    { canEdit, canDelete }: { canEdit: boolean; canDelete: boolean }
): Promise<void> {
    const row = accountRow(page, email);
    const edit = row.getByRole('button', { name: 'Modifier' });
    const remove = row.getByRole('button', { name: 'Supprimer' });

    await (canEdit ? expect(edit).toBeEnabled() : expect(edit).toBeDisabled());
    await (canDelete
        ? expect(remove).toBeEnabled()
        : expect(remove).toBeDisabled());
}

test.describe('login', () => {
    test('USER lands on the dashboard and cannot open data management', async ({
        page,
    }) => {
        await logIn(page, USER);
        await expect(
            page.getByRole('heading', { name: 'Bienvenue User' })
        ).toBeVisible();
        await expect(dataLink(page)).toHaveCount(0);

        await page.goto(USERS_PAGE);
        await expect(page).toHaveURL(/127\.0\.0\.1:3100\/$/);
    });

    test('a wrong password shows an error', async ({ page }) => {
        await openLoginPage(page);
        await page.getByLabel('E-mail').fill(ADMIN);
        await page.getByLabel('Mot de passe').fill('wrong-password');
        await page.getByRole('button', { name: 'Se connecter' }).click();

        await expect(
            page.getByText('E-mail ou mot de passe invalide.')
        ).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('a visitor who is not logged in is sent to the login page', async ({
        page,
    }) => {
        await page.goto(USERS_PAGE);
        await expect(page).toHaveURL(/\/login$/);

        await page.goto('/');
        await expect(page).toHaveURL(/\/login$/);
    });

    test('a new account gets the USER role', async ({ page }) => {
        await openLoginPage(page);
        await page.getByRole('button', { name: 'Créer un compte' }).click();
        await page.getByLabel('Nom').fill('Nouvel aquariophile');
        await page.getByLabel('Département').fill('Loiret');
        await page.getByLabel('E-mail').fill(`new-${Date.now()}@example.test`);
        await page.getByLabel('Mot de passe').fill(PASSWORD);
        await page.getByRole('button', { name: 'Créer le compte' }).click();

        await expect(page).toHaveURL(/127\.0\.0\.1:3100\/$/);
        await page.goto(USERS_PAGE);
        await expect(page).toHaveURL(/127\.0\.0\.1:3100\/$/);
    });
});

test.describe('user management', () => {
    test('ADMIN sees data management and manages USER accounts only', async ({
        page,
    }) => {
        await logIn(page, ADMIN);
        await expect(dataLink(page)).toBeVisible();
        await openUsersPage(page);

        await expectRowActions(page, USER, { canEdit: true, canDelete: true });
        await expectRowActions(page, SUDO, {
            canEdit: false,
            canDelete: false,
        });
        // Son propre compte ADMIN se modifie via « Modifier le profil ».
        await expectRowActions(page, ADMIN, {
            canEdit: false,
            canDelete: false,
        });
    });

    test('ADMIN can only give the USER role', async ({ page }) => {
        await logIn(page, ADMIN);
        await openUsersPage(page);
        await page
            .getByRole('button', { name: 'Ajouter un utilisateur' })
            .click();

        const roleSelect = page.getByRole('dialog').getByRole('combobox');
        await expect(roleSelect).toHaveText('Utilisateur');
        await roleSelect.click();
        await expect(page.getByRole('option')).toHaveText(['Utilisateur']);
    });

    test('SUDO manages ADMIN accounts and can give every role', async ({
        page,
    }) => {
        await logIn(page, SUDO);
        await openUsersPage(page);

        await expectRowActions(page, ADMIN, { canEdit: true, canDelete: true });
        await expectRowActions(page, USER, { canEdit: true, canDelete: true });
        await expectRowActions(page, SUDO, { canEdit: true, canDelete: false });

        await page
            .getByRole('button', { name: 'Ajouter un utilisateur' })
            .click();
        await page.getByRole('dialog').getByRole('combobox').click();
        await expect(page.getByRole('option')).toHaveText([
            'Administrateur',
            'Utilisateur',
            'Super Utilisateur',
        ]);
    });
});
