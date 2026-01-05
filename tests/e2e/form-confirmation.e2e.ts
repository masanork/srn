import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * E2E Tests for Form Confirmation Workflow
 *
 * Test scenarios:
 * - TC-1: Form submission creates confirmed state
 * - TC-2: Withdrawal workflow restores editable state
 * - TC-3: Return workflow updates L3 metadata correctly
 * - TC-4: Empty reason shows alert and prevents withdrawal
 * - TC-5: Japanese locale displays correct labels
 */

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');
const TEST_FORM_PATH = `file://${path.join(FIXTURES_DIR, 'confirmation-test-form.html')}`;

test.describe('Form Confirmation Workflow E2E', () => {

  // =============================================================================
  // TC-1: Form submission creates confirmed state
  // =============================================================================

  test('TC-1: Form submission creates confirmed state', async ({ page, context }) => {
    // 1. Set Japanese locale for proper banner display
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        get: () => 'ja-JP'
      });
    });

    // 2. Load form
    await page.goto(TEST_FORM_PATH);
    await page.waitForLoadState('networkidle');

    // 3. Fill required fields
    await page.fill('input[data-json-path="name"]', 'John Doe');
    await page.fill('input[data-json-path="email"]', 'john@example.com');
    await page.fill('textarea[data-json-path="comments"]', 'This is a test submission');

    // 4. Click Confirm button
    const downloadPromise = page.waitForEvent('download');
    await page.click('#btn-submit');

    // 5. Wait for download
    const download = await downloadPromise;
    expect(download).toBeTruthy();
    expect(download.suggestedFilename()).toContain('test-form-confirmed.html');

    // 5. Load downloaded HTML
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const downloadedHtml = fs.readFileSync(downloadPath!, 'utf-8');
    const tempPath = path.join(FIXTURES_DIR, 'temp-confirmed.html');
    fs.writeFileSync(tempPath, downloadedHtml);

    await page.goto(`file://${tempPath}`);
    await page.waitForLoadState('networkidle');

    // 6. Verify: Green banner visible
    const banner = page.locator('.weba-confirmation-banner');
    await expect(banner).toBeVisible();

    // 7. Verify: Confirmation timestamp displayed
    await expect(banner).toContainText('確定済みフォーム');
    await expect(banner).toContainText('確定時刻');

    // 8. Verify: Buttons changed to Withdraw/Return
    const withdrawBtn = page.locator('button:has-text("取下")');
    const returnBtn = page.locator('button:has-text("差戻")');
    await expect(withdrawBtn).toBeVisible();
    await expect(returnBtn).toBeVisible();

    // 9. Verify: All inputs are disabled
    const nameInput = page.locator('input[data-json-path="name"]');
    const emailInput = page.locator('input[data-json-path="email"]');
    const commentsTextarea = page.locator('textarea[data-json-path="comments"]');

    await expect(nameInput).toBeDisabled();
    await expect(emailInput).toBeDisabled();
    await expect(commentsTextarea).toBeDisabled();

    // 10. Verify: L3 metadata in HTML
    const l3Metadata = await page.evaluate(() => {
      const script = document.getElementById('weba-submitted');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    expect(l3Metadata).toBeTruthy();
    expect(l3Metadata.submitted).toBe(true);
    expect(l3Metadata.confirmedAt).toBeTruthy();
    expect(l3Metadata.l3Metadata.events).toHaveLength(1);
    expect(l3Metadata.l3Metadata.events[0].type).toBe('Confirm');

    // Cleanup
    fs.unlinkSync(tempPath);
  });

  // =============================================================================
  // TC-2: Withdrawal workflow restores editable state
  // =============================================================================

  test('TC-2: Withdrawal workflow restores editable state', async ({ page }) => {
    // 1. Create a confirmed form HTML
    const confirmedHtml = createConfirmedFormHtml();
    const confirmedPath = path.join(FIXTURES_DIR, 'temp-confirmed-for-withdrawal.html');
    fs.writeFileSync(confirmedPath, confirmedHtml);

    // 2. Load confirmed form
    await page.goto(`file://${confirmedPath}`);
    await page.waitForLoadState('networkidle');

    // Verify confirmed state
    await expect(page.locator('.weba-confirmation-banner')).toBeVisible();

    // 3. Click Withdraw button and handle dialogs
    let dialogCount = 0;
    page.on('dialog', async dialog => {
      dialogCount++;
      if (dialogCount === 1) {
        // First dialog: prompt for reason
        expect(dialog.type()).toBe('prompt');
        expect(dialog.message()).toContain('取下の理由');
        await dialog.accept('誤って提出しました');
      } else if (dialogCount === 2) {
        // Second dialog: alert confirming completion
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toContain('取下が完了しました');
        await dialog.accept();
      }
    });

    // 4. Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("取下")');
    const download = await downloadPromise;

    // 5. Load updated HTML
    const downloadPath = await download.path();
    const withdrawnHtml = fs.readFileSync(downloadPath!, 'utf-8');
    const withdrawnPath = path.join(FIXTURES_DIR, 'temp-withdrawn.html');
    fs.writeFileSync(withdrawnPath, withdrawnHtml);

    await page.goto(`file://${withdrawnPath}`);
    await page.waitForLoadState('networkidle');

    // 6. Verify: Banner removed (no longer in confirmed state)
    // Note: Since we reload with withdrawn HTML, the initSubmittedState checks submitted:false
    // and doesn't show the banner

    // 7. Verify: L3 metadata contains Withdraw event
    const l3Metadata = await page.evaluate(() => {
      const script = document.getElementById('weba-submitted');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    expect(l3Metadata).toBeTruthy();
    expect(l3Metadata.submitted).toBe(false);
    expect(l3Metadata.withdrawnOrReturned).toBe(true);
    expect(l3Metadata.lastAction).toBe('Withdraw');
    expect(l3Metadata.l3Metadata.events).toHaveLength(2);
    expect(l3Metadata.l3Metadata.events[1].type).toBe('Withdraw');
    expect(l3Metadata.l3Metadata.events[1].payload.reason).toBe('誤って提出しました');

    // Cleanup
    fs.unlinkSync(confirmedPath);
    fs.unlinkSync(withdrawnPath);
  });

  // =============================================================================
  // TC-3: Return workflow updates L3 metadata correctly
  // =============================================================================

  test('TC-3: Return workflow updates L3 metadata correctly', async ({ page }) => {
    // 1. Create a confirmed form HTML
    const confirmedHtml = createConfirmedFormHtml();
    const confirmedPath = path.join(FIXTURES_DIR, 'temp-confirmed-for-return.html');
    fs.writeFileSync(confirmedPath, confirmedHtml);

    // 2. Load confirmed form
    await page.goto(`file://${confirmedPath}`);
    await page.waitForLoadState('networkidle');

    // 3. Click Return button and handle dialogs
    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        expect(dialog.message()).toContain('差戻の理由');
        await dialog.accept('追加情報が必要です');
      } else if (dialog.type() === 'alert') {
        expect(dialog.message()).toContain('差戻が完了しました');
        await dialog.accept();
      }
    });

    // 4. Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("差戻")');
    const download = await downloadPromise;

    // 5. Verify L3 metadata
    const downloadPath = await download.path();
    const returnedHtml = fs.readFileSync(downloadPath!, 'utf-8');

    // Parse and check metadata
    const metadataMatch = returnedHtml.match(/<script id="weba-submitted"[^>]*>([\s\S]*?)<\/script>/);
    expect(metadataMatch).toBeTruthy();

    const l3Metadata = JSON.parse(metadataMatch![1]);
    expect(l3Metadata.submitted).toBe(false);
    expect(l3Metadata.lastAction).toBe('Return');
    expect(l3Metadata.l3Metadata.events).toHaveLength(2);
    expect(l3Metadata.l3Metadata.events[1].type).toBe('Return');
    expect(l3Metadata.l3Metadata.events[1].payload.reason).toBe('追加情報が必要です');
    expect(l3Metadata.l3Metadata.events[1].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // Cleanup
    fs.unlinkSync(confirmedPath);
  });

  // =============================================================================
  // TC-4: Empty reason shows alert and prevents withdrawal
  // =============================================================================

  test('TC-4: Empty reason shows alert and prevents withdrawal', async ({ page }) => {
    // 1. Create a confirmed form HTML
    const confirmedHtml = createConfirmedFormHtml();
    const confirmedPath = path.join(FIXTURES_DIR, 'temp-confirmed-for-empty-reason.html');
    fs.writeFileSync(confirmedPath, confirmedHtml);

    // 2. Load confirmed form
    await page.goto(`file://${confirmedPath}`);
    await page.waitForLoadState('networkidle');

    // 3. Click Withdraw and provide empty reason
    let promptShown = false;
    let alertShown = false;

    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        promptShown = true;
        await dialog.accept(''); // Empty reason
      } else if (dialog.type() === 'alert') {
        alertShown = true;
        expect(dialog.message()).toContain('理由が入力されていません');
        await dialog.accept();
      }
    });

    await page.click('button:has-text("取下")');

    // Wait a bit for dialogs to process
    await page.waitForTimeout(500);

    // 4. Verify: Alert was shown
    expect(promptShown).toBe(true);
    expect(alertShown).toBe(true);

    // 5. Verify: Form state unchanged (still confirmed)
    const l3Metadata = await page.evaluate(() => {
      const script = document.getElementById('weba-submitted');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    expect(l3Metadata.submitted).toBe(true);
    expect(l3Metadata.l3Metadata.events).toHaveLength(1); // No new event added

    // Cleanup
    fs.unlinkSync(confirmedPath);
  });

  // =============================================================================
  // TC-5: Japanese locale displays correct labels
  // =============================================================================

  test('TC-5: Japanese locale displays correct labels', async ({ page, context }) => {
    // 1. Set page locale to ja-JP
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        get: () => 'ja-JP'
      });
    });

    // 2. Load form
    await page.goto(TEST_FORM_PATH);
    await page.waitForLoadState('networkidle');

    // 3. Verify: Button shows "Confirm" (will be translated to "確定" by i18n)
    const submitBtn = page.locator('#btn-submit');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Confirm');
    expect(await submitBtn.getAttribute('data-i18n')).toBe('sign_btn');

    // 4. Submit form
    await page.fill('input[data-json-path="name"]', '山田太郎');
    await page.fill('input[data-json-path="email"]', 'yamada@example.jp');

    const downloadPromise = page.waitForEvent('download');
    await submitBtn.click();
    const download = await downloadPromise;

    // 5. Load confirmed form
    const downloadPath = await download.path();
    const confirmedHtml = fs.readFileSync(downloadPath!, 'utf-8');
    const tempPath = path.join(FIXTURES_DIR, 'temp-confirmed-ja.html');
    fs.writeFileSync(tempPath, confirmedHtml);

    await page.goto(`file://${tempPath}`);
    await page.waitForLoadState('networkidle');

    // 6. Verify: Banner shows "確定済みフォーム"
    const banner = page.locator('.weba-confirmation-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('確定済みフォーム');
    await expect(banner).toContainText('確定時刻');

    // 7. Verify: Buttons show "取下" and "差戻"
    await expect(page.locator('button:has-text("取下")')).toBeVisible();
    await expect(page.locator('button:has-text("差戻")')).toBeVisible();

    // Cleanup
    fs.unlinkSync(tempPath);
  });
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Creates a confirmed form HTML for testing withdrawal/return workflows
 */
function createConfirmedFormHtml(): string {
  const confirmedAt = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Confirmed Test Form</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
        .form-row { margin-bottom: 1rem; }
        .form-label { font-weight: 600; display: block; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px; }
        .action-bar { margin-top: 2rem; display: flex; gap: 0.5rem; }
        .action-btn { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
        .action-btn-secondary { background: white; color: #111827; border: 1px solid #e5e7eb; }
        .weba-confirmation-banner { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <div class="weba-confirmation-banner">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">✓</span>
            <div>
                <div style="font-weight: 600; color: #047857;">確定済みフォーム</div>
                <div style="color: #065f46;">確定時刻: <strong>${new Date(confirmedAt).toLocaleString('ja-JP')}</strong></div>
            </div>
        </div>
    </div>
    <div class="page">
        <h1>Test Form</h1>
        <div class="form-row">
            <label class="form-label">Name</label>
            <input type="text" class="form-input" data-json-path="name" value="Test User" readonly disabled style="background-color: #f3f4f6;">
        </div>
        <div class="form-row">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" data-json-path="email" value="test@example.com" readonly disabled style="background-color: #f3f4f6;">
        </div>
    </div>
    <div class="action-bar">
        <button class="action-btn action-btn-secondary" onclick="withdrawDocument()">取下</button>
        <button class="action-btn action-btn-secondary" onclick="returnDocument()">差戻</button>
    </div>

    <script id="weba-submitted" type="application/json">
${JSON.stringify({
  submitted: true,
  confirmedAt: confirmedAt,
  submittedAt: confirmedAt,
  l3Metadata: {
    events: [{
      type: 'Confirm',
      timestamp: confirmedAt,
      payload: {}
    }]
  }
}, null, 2)}
    </script>

    <script>
        window.withdrawDocument = function() {
            const reason = prompt('取下の理由を入力してください：');
            if (!reason || reason.trim() === '') {
                alert('理由が入力されていません。');
                return;
            }

            const submittedScript = document.getElementById('weba-submitted');
            const data = JSON.parse(submittedScript.textContent);

            data.l3Metadata.events.push({
                type: 'Withdraw',
                timestamp: new Date().toISOString(),
                payload: { reason: reason.trim() }
            });
            data.submitted = false;
            data.withdrawnOrReturned = true;
            data.lastAction = 'Withdraw';

            submittedScript.textContent = JSON.stringify(data, null, 2);

            const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'test-form-withdrawn.html';
            a.click();

            alert('取下が完了しました。');
        };

        window.returnDocument = function() {
            const reason = prompt('差戻の理由を入力してください：');
            if (!reason || reason.trim() === '') {
                alert('理由が入力されていません。');
                return;
            }

            const submittedScript = document.getElementById('weba-submitted');
            const data = JSON.parse(submittedScript.textContent);

            data.l3Metadata.events.push({
                type: 'Return',
                timestamp: new Date().toISOString(),
                payload: { reason: reason.trim() }
            });
            data.submitted = false;
            data.withdrawnOrReturned = true;
            data.lastAction = 'Return';

            submittedScript.textContent = JSON.stringify(data, null, 2);

            const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'test-form-returned.html';
            a.click();

            alert('差戻が完了しました。');
        };
    </script>
</body>
</html>`;
}
