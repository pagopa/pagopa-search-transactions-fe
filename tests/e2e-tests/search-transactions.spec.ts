import { test, expect } from '@playwright/test';

const BASE_URL = String(process.env.BASE_URL);
const ENTE_FISCAL_CODE = String(process.env.ENTE_FISCAL_CODE);
const ENTE_FISCAL_CODE_INVALID = String(process.env.ENTE_FISCAL_CODE_INVALID);
const CITIZEN_FISCAL_CODE = String(process.env.CITIZEN_FISCAL_CODE);
const CITIZEN_FISCAL_CODE_INVALID = String(process.env.CITIZEN_FISCAL_CODE_INVALID);
const NAV = String(process.env.NAV);
const NAV_INVALID = String(process.env.NAV_INVALID);
const NAV_DIFFERENT = String(process.env.NAV_DIFFERENT);
const TOKEN = String(process.env.SEARCH_TRANSACTIONS_TOKEN);
const TOKEN_INVALID = String(process.env.SEARCH_TRANSACTIONS_TOKEN_INVALID);

test.describe('Search Transactions - E2E Tests', () => {
    test('should load the search transactions page', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('p')).toHaveText('Verifica pagamenti CIE');
    });

    test('should show full page error when fragment params are missing', async ({ page }) => {
        await page.goto(BASE_URL);

        const alert = page
            .getByRole('alert')
            .filter({ hasText: 'Parametri mancanti' });

        await expect(alert).toBeVisible();
        await expect(alert.locator('.MuiAlertTitle-root')).toHaveText('Parametri mancanti');
        await expect(alert).toContainText(
            'CF Ente, CF Cittadino e NAV devono essere nel fragment URL oltre al token di sicurezza'
        );
    });

    test('should show full page error when ente fiscal code is invalid', async ({ page }) => {
        await page.goto(`${BASE_URL}#?enteFiscalCode=${ENTE_FISCAL_CODE_INVALID}&citizenFiscalCode=${CITIZEN_FISCAL_CODE}&nav=${NAV}&token=${TOKEN}`);

        const alert = page
            .getByRole('alert')
            .filter({ hasText: 'Parametri non validi' });

        await expect(alert).toBeVisible();
        await expect(alert.locator('.MuiAlertTitle-root')).toHaveText('Parametri non validi');
        await expect(alert).toContainText(
            'Il codice fiscale ente indicato non è formalmente corretto.'
        );
    });

    test('should show full page error when citizen fiscal code is invalid', async ({ page }) => {
        await page.goto(`${BASE_URL}#?enteFiscalCode=${ENTE_FISCAL_CODE}&citizenFiscalCode=${CITIZEN_FISCAL_CODE_INVALID}&nav=${NAV}&token=${TOKEN}`);

        const alert = page
            .getByRole('alert')
            .filter({ hasText: 'Parametri non validi' });

        await expect(alert).toBeVisible();
        await expect(alert.locator('.MuiAlertTitle-root')).toHaveText('Parametri non validi');
        await expect(alert).toContainText(
            'Il codice fiscale cittadino indicato non è formalmente corretto.'
        );
    });

    test('should show full page error when NAV code is invalid', async ({ page }) => {
        await page.goto(`${BASE_URL}#?enteFiscalCode=${ENTE_FISCAL_CODE}&citizenFiscalCode=${CITIZEN_FISCAL_CODE}&nav=${NAV_INVALID}&token=${TOKEN}`);
        const alert = page
            .getByRole('alert')
            .filter({ hasText: 'Parametri non validi' });

        await expect(alert).toBeVisible();
        await expect(alert.locator('.MuiAlertTitle-root')).toHaveText('Parametri non validi');
        await expect(alert).toContainText(
            'Il numero avviso / NAV indicato non è valido per questa richiesta.'
        );
    });

    test('should show full page error when TOKEN code is invalid', async ({ page }) => {
        await page.goto(`${BASE_URL}#?enteFiscalCode=${ENTE_FISCAL_CODE}&citizenFiscalCode=${CITIZEN_FISCAL_CODE}&nav=${NAV}&token=${TOKEN_INVALID}`);
        const alert = page
            .getByRole('alert')
            .filter({ hasText: 'Utente non autorizzato' });

        await expect(alert).toBeVisible();
        await expect(alert.locator('.MuiAlertTitle-root')).toHaveText('Utente non autorizzato');
        await expect(alert).toContainText(
            'Non sei autorizzato a effettuare questa operazione.'
        );
    });

    test('should show full page error when NAV code is different', async ({ page }) => {
        await page.goto(`${BASE_URL}#?enteFiscalCode=${ENTE_FISCAL_CODE}&citizenFiscalCode=${CITIZEN_FISCAL_CODE}&nav=${NAV_DIFFERENT}&token=${TOKEN}`);
        const alert = page
            .getByRole('alert')
            .filter({ hasText: 'Pagamento non trovato' });

        await expect(alert).toBeVisible();
        await expect(alert.locator('.MuiAlertTitle-root')).toHaveText('Pagamento non trovato');
        await expect(alert).toContainText(
            'Non è stato trovato alcun pagamento con i dati indicati.'
        );
    });

    test('should show paid notice result with request data and payment details', async ({ page }) => {
        await page.goto(
            `${BASE_URL}#?enteFiscalCode=${ENTE_FISCAL_CODE}&citizenFiscalCode=${CITIZEN_FISCAL_CODE}&nav=${NAV}&token=${TOKEN}`
        );

        const main = page.locator('main');

        await expect(
            page.getByRole('heading', { level: 6, name: 'Esito verifica pagamento' })
        ).toBeVisible();

        const successAlert = page
            .getByRole('alert')
            .filter({ hasText: 'Pagamento trovato.' });

        await expect(successAlert).toBeVisible();
        await expect(successAlert).toContainText('Pagamento trovato.');

        await expect(main).toContainText('Dati richiesta');
        await expect(main).toContainText('CF Ente');
        await expect(main).toContainText(ENTE_FISCAL_CODE);
        await expect(main).toContainText('CF Cittadino');
        await expect(main).toContainText(CITIZEN_FISCAL_CODE);
        await expect(main).toContainText('Numero avviso / NAV');
        await expect(main).toContainText(NAV);

        await expect(main).toContainText('Stato');
        await expect(main).toContainText('PAGATO');
    });

    test('should show rate limit error after repeated requests trigger 429', async ({ page }) => {
        const url =
            `${BASE_URL}#?enteFiscalCode=${ENTE_FISCAL_CODE}` +
            `&citizenFiscalCode=${CITIZEN_FISCAL_CODE}` +
            `&nav=${NAV}` +
            `&token=${TOKEN}`;

        const alert = page.getByRole('alert').filter({ hasText: 'Troppe richieste' });

        await page.goto(url);

        let got429 = false;
        const maxAttempts = 10;

        for (let i = 0; i < maxAttempts; i++) {
            const responsePromise = page.waitForResponse(response =>
                response.url().includes('/transactions') && response.status() === 429,
                { timeout: 100 }
            ).catch(() => null);

            await page.reload();

            const response = await responsePromise;
            if (response) {
                got429 = true;
                break;
            }

            if (await alert.isVisible().catch(() => false)) {
                got429 = true;
                break;
            }
        }

        expect(got429).toBeTruthy();

        await expect(alert).toBeVisible();
        await expect(alert.locator('.MuiAlertTitle-root')).toHaveText('Troppe richieste');
        await expect(alert).toContainText(
            'Hai effettuato troppe richieste. Riprova tra qualche minuto.'
        );
    });
});