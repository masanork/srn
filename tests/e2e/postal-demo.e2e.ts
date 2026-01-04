
import { test, expect } from '@playwright/test';
import path from 'path';

const DIST_DIR = path.resolve(__dirname, '../../dist/srn');

test.describe('Postal Demo E2E Tests', () => {
    test('should switch tabs without errors (custom plugin bundle)', async ({ page }) => {
        const errors: Error[] = [];
        const consoleLogs: string[] = [];

        page.on('pageerror', err => {
            console.log('Page error:', err.message);
            errors.push(err);
        });

        page.on('console', msg => {
            consoleLogs.push(msg.text());
        });

        const filePath = `file://${path.join(DIST_DIR, 'examples/postal-demo.html')}`;
        await page.goto(filePath);

        // Wait for runtime to initialize
        await page.waitForTimeout(2000);

        // Verify tab buttons exist
        const tabButtons = page.locator('button.tab-btn');
        const tabCount = await tabButtons.count();
        expect(tabCount).toBeGreaterThan(0);

        // Click multiple tabs
        if (tabCount >= 2) {
            await tabButtons.nth(1).click();
            await page.waitForTimeout(300);

            if (tabCount >= 3) {
                await tabButtons.nth(2).click();
                await page.waitForTimeout(300);
            }

            // Go back to first tab
            await tabButtons.nth(0).click();
            await page.waitForTimeout(300);
        }

        // Check for errors
        expect(errors).toHaveLength(0);

        // Verify "Early switchTab" is NOT being called repeatedly
        const earlyMessages = consoleLogs.filter(log => log.includes('Early switchTab'));
        console.log(`Early switchTab calls: ${earlyMessages.length}`);

        // It's ok if early switchTab is called once or twice during initialization,
        // but it should NOT be called for every tab click
        expect(earlyMessages.length).toBeLessThan(5);
    });

    test('should have data-action attributes on tab buttons', async ({ page }) => {
        const filePath = `file://${path.join(DIST_DIR, 'examples/postal-demo.html')}`;
        await page.goto(filePath);

        // Verify tab buttons have data-action attributes
        const tabBtn = page.locator('button.tab-btn').first();
        await expect(tabBtn).toBeVisible();
        await expect(tabBtn).toHaveAttribute('data-action', 'switch-tab');
        await expect(tabBtn).toHaveAttribute('data-tab-id');
    });
});
