
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
});
