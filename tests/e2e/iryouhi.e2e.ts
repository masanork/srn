
import { test, expect } from '@playwright/test';
import path from 'path';

const DIST_DIR = path.resolve(__dirname, '../../dist/srn');

test.describe('Iryouhi Form E2E Tests', () => {
    test('should not have ReferenceError when clicking "Add Row" button', async ({ page }) => {
        const errors: Error[] = [];
        page.on('pageerror', err => {
            console.log('Page error:', err.message);
            errors.push(err);
        });

        const filePath = `file://${path.join(DIST_DIR, 'examples/iryouhi.html')}`;
        await page.goto(filePath);

        // Wait for basic elements to load
        await expect(page.locator('button.add-row-btn')).toBeVisible();

        // Click the "Add Row" button
        await page.click('button.add-row-btn');

        // Check for any errors
        expect(errors).toHaveLength(0);
    });

    test('should have data-action attributes for event delegation', async ({ page }) => {
        const filePath = `file://${path.join(DIST_DIR, 'examples/iryouhi.html')}`;
        await page.goto(filePath);

        // Verify data-action attributes exist on buttons
        const addBtn = page.locator('button.add-row-btn').first();
        await expect(addBtn).toBeVisible();
        await expect(addBtn).toHaveAttribute('data-action', 'add-row');
        await expect(addBtn).toHaveAttribute('data-table-key');

        // Verify tab button has data-action
        const tabBtn = page.locator('button.tab-btn').first();
        if (await tabBtn.count() > 0) {
            await expect(tabBtn).toHaveAttribute('data-action', 'switch-tab');
            await expect(tabBtn).toHaveAttribute('data-tab-id');
        }

        // Verify toolbar buttons have data-action
        const clearBtn = page.locator('button.btn-clear');
        if (await clearBtn.count() > 0) {
            await expect(clearBtn).toHaveAttribute('data-action', 'clear-data');
        }
    });

    test('should work with event delegation (no errors when clicking buttons)', async ({ page }) => {
        const errors: Error[] = [];
        page.on('pageerror', err => {
            console.log('Page error:', err.message);
            errors.push(err);
        });

        const filePath = `file://${path.join(DIST_DIR, 'examples/iryouhi.html')}`;
        await page.goto(filePath);

        // Wait for runtime to initialize
        await page.waitForTimeout(1500);

        // Click add button multiple times
        await page.click('button.add-row-btn');
        await page.waitForTimeout(300);
        await page.click('button.add-row-btn');

        // Try to remove a row if exists
        const removeBtn = page.locator('button.remove-row-btn').first();
        if (await removeBtn.count() > 0) {
            await removeBtn.click();
        }

        // Verify no errors occurred
        expect(errors).toHaveLength(0);
    });
});
