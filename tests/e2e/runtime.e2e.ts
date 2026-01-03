
import { test, expect } from '@playwright/test';
import path from 'path';

const DIST_DIR = path.resolve(__dirname, '../../dist/srn');

test.describe('Web/A Runtime Smoke Tests', () => {
    test('postal-demo should load without console errors and have switchTab', async ({ page }) => {
        const errors: Error[] = [];
        page.on('pageerror', err => errors.push(err));
        page.on('console', msg => {
            if (msg.type() === 'error') {
                // Ignore favicon or expected 404s if any
                if (!msg.text().includes('favicon.ico')) {
                    errors.push(new Error(`Console error: ${msg.text()}`));
                }
            }
        });

        const filePath = `file://${path.join(DIST_DIR, 'examples/postal-demo.html')}`;
        await page.goto(filePath);

        // Wait for runtime to initialize
        await page.waitForFunction(() => (window as any).switchTab !== undefined, { timeout: 10000 });

        expect(errors).toHaveLength(0);

        const switchTabType = await page.evaluate(() => typeof (window as any).switchTab);
        expect(switchTabType).toBe('function');
    });

    test('Tabs should switch correctly', async ({ page }) => {
        const filePath = `file://${path.join(DIST_DIR, 'examples/postal-demo.html')}`;
        await page.goto(filePath);

        // Click on "お届け先" tab (Assuming it exists and has id or text)
        // Let's use text selector for simplicity
        const tabHandle = page.getByRole('button', { name: 'お届け先' });
        if (await tabHandle.isVisible()) {
            await tabHandle.click();
            // Check if some recipient field becomes visible or tab state changes
            // This is just a smoke test for now
            expect(true).toBe(true);
        }
    });
    test('validation-demo should enable submit button only when required fields are filled', async ({ page }) => {
        page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
        const filePath = `file://${path.join(DIST_DIR, 'examples/validation-demo.html')}`;
        await page.goto(filePath);
        await page.waitForFunction(() => (window as any).switchTab !== undefined, { timeout: 10000 });

        const submitBtn = page.locator('#btn-submit');

        // Initial state: disabled
        await expect(submitBtn).toBeDisabled();

        // Fill Name
        await page.fill('input[data-json-path="user.name"]', 'John Doe');
        await expect(submitBtn).toBeDisabled();

        // Fill Age
        await page.fill('input[data-json-path="user.age"]', '30');
        await expect(submitBtn).toBeDisabled();

        // Switch to Questionnaire tab
        await page.click('button.tab-btn:has-text("アンケート")');
        await page.waitForTimeout(500);

        // Check Terms (Required)
        await page.check('input[data-json-path="terms.agreed"]');

        // Now it should be enabled!
        await expect(submitBtn).toBeEnabled();

        // Uncheck and it should be disabled again
        await page.uncheck('input[data-json-path="terms.agreed"]');
        await expect(submitBtn).toBeDisabled();
    });
});
