import { expect, test, type Locator, type Page } from '@playwright/test';

// Accounts created by scripts/seed-e2e-users.ts.
const PASSWORD = 'Fishkeeper-test-123!';
const USER = 'user@example.test';
const ADMIN = 'admin@example.test';
const SUDO = 'sudo@example.test';

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

async function logIn(
    page: Page,
    email: string,
    password = PASSWORD
): Promise<void> {
    await openLoginPage(page);
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
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
    test('USER lands on the aquariums and cannot open user management', async ({
        page,
    }) => {
        await logIn(page, USER);
        await expect(page).toHaveURL(/\/aquariums$/);

        await page.goto('/user');
        await expect(page).toHaveURL(/\/aquariums$/);
    });

    test('a wrong password shows an error', async ({ page }) => {
        await logIn(page, ADMIN, 'wrong-password');

        await expect(
            page.getByText('E-mail ou mot de passe invalide.')
        ).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('a visitor who is not logged in is sent to the login page', async ({
        page,
    }) => {
        await page.goto('/user');

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

        await expect(page).toHaveURL(/\/aquariums$/);
        await page.goto('/user');
        await expect(page).toHaveURL(/\/aquariums$/);
    });
});

test.describe('user management', () => {
    test('ADMIN manages USER accounts only', async ({ page }) => {
        await logIn(page, ADMIN);
        await expect(page).toHaveURL(/\/user$/);
        await expect(
            page.getByRole('heading', { name: 'Utilisateurs' })
        ).toBeVisible();

        await expectRowActions(page, USER, { canEdit: true, canDelete: true });
        await expectRowActions(page, SUDO, {
            canEdit: false,
            canDelete: false,
        });
        await expectRowActions(page, ADMIN, {
            canEdit: true,
            canDelete: false,
        });
    });

    test('ADMIN can only give the USER role', async ({ page }) => {
        await logIn(page, ADMIN);
        await page
            .getByRole('button', { name: 'Ajouter un utilisateur' })
            .click();

        const roleSelect = page.getByRole('dialog').getByRole('combobox');
        await expect(roleSelect).toHaveText('Utilisateur');
        await expect(roleSelect).toBeDisabled();
    });

    test('SUDO manages ADMIN accounts and can give every role', async ({
        page,
    }) => {
        await logIn(page, SUDO);
        await expect(page).toHaveURL(/\/user$/);

        await expectRowActions(page, ADMIN, { canEdit: true, canDelete: true });
        await expectRowActions(page, USER, { canEdit: true, canDelete: true });
        await expectRowActions(page, SUDO, { canEdit: true, canDelete: false });

        await page
            .getByRole('button', { name: 'Ajouter un utilisateur' })
            .click();
        await page.getByRole('dialog').getByRole('combobox').click();
        await expect(page.getByRole('option')).toHaveText([
            'Utilisateur',
            'Administrateur',
            'Super Utilisateur',
        ]);
    });
});
