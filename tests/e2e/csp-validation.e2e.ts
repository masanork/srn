import { test, expect } from '@playwright/test';
import path from 'path';

const DIST_DIR = path.resolve(__dirname, '../../dist/srn');

test.describe('CSP Validation E2E Tests', () => {
    test('should not have CSP violations in postal-demo', async ({ page }) => {
        const cspViolations: string[] = [];
        const pageErrors: Error[] = [];

        // Listen for CSP violations
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Content Security Policy') ||
                text.includes('Not allowed to load') ||
                text.includes('refused to')) {
                cspViolations.push(text);
                console.log('CSP Violation:', text);
            }
        });

        // Listen for page errors
        page.on('pageerror', err => {
            pageErrors.push(err);
            console.log('Page error:', err.message);
        });

        const filePath = `file://${path.join(DIST_DIR, 'examples/postal-demo.html')}`;
        await page.goto(filePath, { waitUntil: 'networkidle' });

        // Wait for the page to fully load and initialize
        await page.waitForTimeout(2000);

        // Interact with the page to trigger any lazy-loaded resources
        const tabButtons = page.locator('button.tab-btn');
        const tabCount = await tabButtons.count();

        if (tabCount > 0) {
            for (let i = 0; i < Math.min(tabCount, 3); i++) {
                await tabButtons.nth(i).click();
                await page.waitForTimeout(300);
            }
        }

        // Check for submit button and click it to trigger form-related CSP checks
        const submitButton = page.locator('button[data-action="submit"]');
        if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(1000);
        }

        // Verify no CSP violations occurred
        if (cspViolations.length > 0) {
            console.error('CSP Violations detected:');
            cspViolations.forEach(v => console.error('  -', v));
        }
        expect(cspViolations).toHaveLength(0);

        // Verify no page errors occurred
        if (pageErrors.length > 0) {
            console.error('Page errors detected:');
            pageErrors.forEach(e => console.error('  -', e.message));
        }
        expect(pageErrors).toHaveLength(0);
    });

    test('should not have CSP violations in postal-demo.report', async ({ page }) => {
        const cspViolations: string[] = [];

        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Content Security Policy') ||
                text.includes('Not allowed to load') ||
                text.includes('refused to')) {
                cspViolations.push(text);
                console.log('CSP Violation:', text);
            }
        });

        const filePath = `file://${path.join(DIST_DIR, 'examples/postal-demo.report.html')}`;
        await page.goto(filePath, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        expect(cspViolations).toHaveLength(0);
    });

    test('should allow blob URLs for images and fonts', async ({ page }) => {
        const cspViolations: string[] = [];
        const blobUrlErrors: string[] = [];

        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('blob:') &&
                (text.includes('Not allowed') || text.includes('refused'))) {
                blobUrlErrors.push(text);
                console.log('Blob URL Error:', text);
            }
            if (text.includes('Content Security Policy')) {
                cspViolations.push(text);
            }
        });

        const filePath = `file://${path.join(DIST_DIR, 'examples/postal-demo.html')}`;
        await page.goto(filePath, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Specifically check for blob URL errors
        if (blobUrlErrors.length > 0) {
            console.error('Blob URL errors detected:');
            blobUrlErrors.forEach(e => console.error('  -', e));
        }
        expect(blobUrlErrors).toHaveLength(0);
    });
});
