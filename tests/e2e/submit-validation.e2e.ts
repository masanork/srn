import { test, expect } from '@playwright/test';

test.describe('Submit Button Visual Validation', () => {
    // Access from dist/srn root so relative paths to data/blobs work
    const formUrl = 'file:///Users/masanork/repo/srn/dist/srn/examples/submit-validation-test.html';

    test.beforeEach(async ({ page }) => {
        await page.goto(formUrl);
        await page.waitForLoadState('networkidle');
    });

    test('TC-1: Form with required fields - button starts in incomplete state', async ({ page }) => {
        const submitBtn = page.locator('#btn-submit');

        await expect(submitBtn).toHaveClass(/btn-submit-incomplete/);
        await expect(submitBtn).not.toBeDisabled();
    });

    test('TC-2: Click incomplete form shows validation dialog', async ({ page }) => {
        const submitBtn = page.locator('#btn-submit');

        // Click submit without filling required fields
        await submitBtn.click();

        // Dialog should appear
        const dialog = page.locator('.validation-dialog');
        await expect(dialog).toBeVisible();

        // Dialog should list missing fields
        const missingFields = page.locator('.validation-missing-fields');
        await expect(missingFields).toBeVisible();
        await expect(missingFields).toContainText('Name');
        await expect(missingFields).toContainText('Email');

        // Dialog should have cancel and submit buttons
        const cancelBtn = page.locator('[data-action="dialog-cancel"]');
        const submitAnywayBtn = page.locator('[data-action="dialog-submit"]');
        await expect(cancelBtn).toBeVisible();
        await expect(submitAnywayBtn).toBeVisible();
    });

    test('TC-3: Dialog cancel button returns to form', async ({ page }) => {
        const submitBtn = page.locator('#btn-submit');

        await submitBtn.click();
        await page.waitForSelector('.validation-dialog');

        const cancelBtn = page.locator('[data-action="dialog-cancel"]');
        await cancelBtn.click();

        // Dialog should close
        await expect(page.locator('.validation-dialog')).not.toBeVisible();

        // No download should occur
        const downloads: any[] = [];
        page.on('download', download => downloads.push(download));

        await page.waitForTimeout(500);
        expect(downloads.length).toBe(0);
    });

    test('TC-4: Dialog submit button proceeds with download', async ({ page }) => {
        const submitBtn = page.locator('#btn-submit');

        await submitBtn.click();
        await page.waitForSelector('.validation-dialog');

        // Set up download listener
        const downloadPromise = page.waitForEvent('download');

        const submitAnywayBtn = page.locator('[data-action="dialog-submit"]');
        await submitAnywayBtn.click();

        // Download should start
        const download = await downloadPromise;
        expect(download).toBeTruthy();
        expect(download.suggestedFilename()).toMatch(/submit.*\\.html/);
    });

    test('TC-5: ESC key closes dialog', async ({ page }) => {
        const submitBtn = page.locator('#btn-submit');

        await submitBtn.click();
        await page.waitForSelector('.validation-dialog');

        // Press ESC
        await page.keyboard.press('Escape');

        // Dialog should close
        await expect(page.locator('.validation-dialog')).not.toBeVisible();
    });

    test('TC-6: Clicking outside dialog closes it', async ({ page }) => {
        const submitBtn = page.locator('#btn-submit');

        await submitBtn.click();
        await page.waitForSelector('.validation-dialog');

        // Click overlay (outside dialog)
        const overlay = page.locator('.validation-dialog-overlay');
        await overlay.click({ position: { x: 10, y: 10 } });

        // Dialog should close
        await expect(page.locator('.validation-dialog')).not.toBeVisible();
    });

    test('TC-7: Progressive validation - button state changes as fields are filled', async ({ page }) => {
        const submitBtn = page.locator('#btn-submit');
        const nameInput = page.locator('input[data-json-path="name"]');
        const emailInput = page.locator('input[data-json-path="email"]');

        // Initially incomplete
        await expect(submitBtn).toHaveClass(/btn-submit-incomplete/);

        // Fill name (still incomplete - email missing)
        await nameInput.fill('Test User');
        await page.waitForTimeout(100);
        await expect(submitBtn).toHaveClass(/btn-submit-incomplete/);

        // Fill email (now complete - country still missing)
        await emailInput.fill('test@example.com');
        await page.waitForTimeout(200);

        // Button should still be incomplete (country, city, radio required)
        await expect(submitBtn).toHaveClass(/btn-submit-incomplete/);
    });

    test('TC-8: Complete all required fields makes button ready', async ({ page }) => {
        const nameInput = page.locator('input[data-json-path="name"]');
        const emailInput = page.locator('input[data-json-path="email"]');
        const countryInput = page.locator('input[data-json-path="country"]');
        const cityInput = page.locator('input[data-json-path="city"]');
        const radioOption = page.locator('input[name="preferred_contact"][value="Email"]');
        const submitBtn = page.locator('#btn-submit');

        // Fill all required fields
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        await countryInput.fill('Japan'); // Not USA, so state is hidden
        await cityInput.fill('Tokyo');
        await radioOption.click();
        await page.waitForTimeout(200);

        // Button should be ready
        await expect(submitBtn).toHaveClass(/btn-submit-ready/);
        await expect(submitBtn).not.toHaveClass(/btn-submit-incomplete/);

        // Set up download listener
        const downloadPromise = page.waitForEvent('download');

        // Click submit
        await submitBtn.click();

        // Should NOT show dialog
        await page.waitForTimeout(300);
        await expect(page.locator('.validation-dialog')).not.toBeVisible();

        // Download should start directly
        const download = await downloadPromise;
        expect(download).toBeTruthy();
    });

    test('TC-9: Radio group validation', async ({ page }) => {
        const nameInput = page.locator('input[data-json-path="name"]');
        const emailInput = page.locator('input[data-json-path="email"]');
        const countryInput = page.locator('input[data-json-path="country"]');
        const cityInput = page.locator('input[data-json-path="city"]');
        const submitBtn = page.locator('#btn-submit');

        // Fill text fields but not radio
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        await countryInput.fill('Japan');
        await cityInput.fill('Tokyo');
        await page.waitForTimeout(200);

        // Button should still be incomplete (radio required)
        await expect(submitBtn).toHaveClass(/btn-submit-incomplete/);

        // Click submit
        await submitBtn.click();
        await page.waitForSelector('.validation-dialog');

        // Dialog should mention preferred contact
        const missingFields = page.locator('.validation-missing-fields');
        await expect(missingFields).toContainText('Preferred Contact');

        // Close dialog
        await page.keyboard.press('Escape');

        // Select radio option
        const radioOption = page.locator('input[name="preferred_contact"][value="Email"]');
        await radioOption.click();
        await page.waitForTimeout(200);

        // Button should now be ready
        await expect(submitBtn).toHaveClass(/btn-submit-ready/);
    });

    test('TC-10: Tooltip shows on incomplete button hover', async ({ page }) => {
        const submitBtn = page.locator('#btn-submit');

        // Hover over button
        await submitBtn.hover();

        // Tooltip should be set
        const title = await submitBtn.getAttribute('title');
        expect(title).toBeTruthy();
        expect(title).toMatch(/required|必須/i);
    });

    test('TC-11: Tooltip clears on complete button', async ({ page }) => {
        const nameInput = page.locator('input[data-json-path="name"]');
        const emailInput = page.locator('input[data-json-path="email"]');
        const countryInput = page.locator('input[data-json-path="country"]');
        const cityInput = page.locator('input[data-json-path="city"]');
        const radioOption = page.locator('input[name="preferred_contact"][value="Email"]');
        const submitBtn = page.locator('#btn-submit');

        // Fill all required fields
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        await countryInput.fill('Japan');
        await cityInput.fill('Tokyo');
        await radioOption.click();
        await page.waitForTimeout(200);

        // Tooltip should be empty
        const title = await submitBtn.getAttribute('title');
        expect(title).toBe('');
    });

    test('TC-12: Hidden fields (show_if) do not block submission', async ({ page }) => {
        const nameInput = page.locator('input[data-json-path="name"]');
        const emailInput = page.locator('input[data-json-path="email"]');
        const countryInput = page.locator('input[data-json-path="country"]');
        const cityInput = page.locator('input[data-json-path="city"]');
        const radioOption = page.locator('input[name="preferred_contact"][value="Email"]');
        const submitBtn = page.locator('#btn-submit');

        // Fill all visible required fields (state is hidden)
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        await countryInput.fill('Japan'); // Not USA, so state is hidden
        await cityInput.fill('Tokyo');
        await radioOption.click();
        await page.waitForTimeout(200);

        // Button should be ready (hidden state field doesn't block)
        await expect(submitBtn).toHaveClass(/btn-submit-ready/);

        // Clicking should submit directly
        const downloadPromise = page.waitForEvent('download');
        await submitBtn.click();

        const download = await downloadPromise;
        expect(download).toBeTruthy();
    });

    test('TC-13: i18n - Japanese dialog messages', async ({ page }) => {
        // Set language to Japanese
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'language', {
                get: () => 'ja-JP'
            });
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        const submitBtn = page.locator('#btn-submit');
        await submitBtn.click();
        await page.waitForSelector('.validation-dialog');

        // Dialog should have Japanese text
        const title = page.locator('.validation-dialog-title');
        await expect(title).toContainText('未入力');

        const cancelBtn = page.locator('[data-action="dialog-cancel"]');
        await expect(cancelBtn).toContainText('戻る');

        const submitBtn2 = page.locator('[data-action="dialog-submit"]');
        await expect(submitBtn2).toContainText('提出');
    });
});

test.describe('Submit Button Accessibility', () => {
    const formUrl = 'file:///Users/masanork/repo/srn/dist/srn/examples/submit-validation-test.html';

    test('TC-A1: Button is keyboard accessible', async ({ page }) => {
        await page.goto(formUrl);
        await page.waitForLoadState('networkidle');

        const submitBtn = page.locator('#btn-submit');

        // Tab to button
        await page.keyboard.press('Tab');
        // Continue tabbing until we reach submit button
        for (let i = 0; i < 20; i++) {
            const focused = await page.evaluate(() => document.activeElement?.id);
            if (focused === 'btn-submit') break;
            await page.keyboard.press('Tab');
        }

        // Submit button should be focused
        await expect(submitBtn).toBeFocused();

        // Enter should trigger click
        await page.keyboard.press('Enter');

        // Dialog should appear
        await expect(page.locator('.validation-dialog')).toBeVisible();
    });
});
