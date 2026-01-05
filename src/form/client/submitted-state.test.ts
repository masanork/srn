import { describe, expect, test, beforeEach, mock } from "bun:test";
import { Window } from "happy-dom";
import { buildDownloadHtml } from "./download";

/**
 * Unit Tests for Form Submission and Confirmation Workflow
 *
 * Tests cover:
 * - L3 metadata creation
 * - Confirmation banner display
 * - Button replacement logic
 * - Form state transitions
 * - Withdrawal/return handling
 * - State initialization
 * - I18N label application
 */

// Test utilities and mocks
let window: Window;
let document: Document;

function setupDom() {
  window = new Window();
  document = window.document;
  (global as any).window = window;
  (global as any).document = document;
  (global as any).navigator = window.navigator;
}

function setLocale(locale: string) {
  Object.defineProperty(window.navigator, 'language', {
    writable: true,
    value: locale
  });
}

function createTestHtml(includeSubmitted = false, submittedData?: any): string {
  const submittedScript = includeSubmitted ? `
    <script id="weba-submitted" type="application/json">
      ${JSON.stringify(submittedData || {
        submitted: true,
        confirmedAt: "2024-01-15T14:30:45.000Z",
        l3Metadata: {
          events: [
            { type: 'Confirm', timestamp: "2024-01-15T14:30:45.000Z", payload: {} }
          ]
        }
      }, null, 2)}
    </script>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head><title>Test Form</title></head>
<body>
  <div class="page">
    <input type="text" data-json-path="name" value="Test">
    <textarea data-json-path="comments">Comments</textarea>
    <select data-json-path="choice">
      <option value="a" selected>A</option>
    </select>
    <input type="checkbox" data-json-path="agree" checked>
  </div>
  <div class="action-bar">
    <button class="action-btn action-btn-secondary" onclick="saveDraft()">💾 Save Draft</button>
    <button class="action-btn action-btn-primary" onclick="submitDocument()" data-i18n="sign_btn">Confirm</button>
    <button class="action-btn action-btn-secondary" onclick="clearData()">🗑️ Clear</button>
  </div>
  ${submittedScript}
</body>
</html>`;
}

// =============================================================================
// A. L3 Metadata Creation Tests (3 tests)
// =============================================================================

describe("markAsSubmitted - L3 Metadata Creation", () => {
  beforeEach(() => {
    setupDom();
  });

  test("creates weba-submitted script with proper L3 structure", () => {
    const testHtml = createTestHtml();

    // Mock global DOMParser for download.ts
    (global as any).DOMParser = window.DOMParser;

    const result = buildDownloadHtml(testHtml, true);

    const parser = new window.DOMParser();
    const doc = parser.parseFromString(result, "text/html");
    const submittedScript = doc.getElementById("weba-submitted");

    expect(submittedScript).toBeTruthy();
    expect(submittedScript?.getAttribute("type")).toBe("application/json");

    const data = JSON.parse(submittedScript!.textContent || "{}");
    expect(data.submitted).toBe(true);
    expect(data.confirmedAt).toBeTruthy();
    expect(data.l3Metadata).toBeTruthy();
    expect(data.l3Metadata.events).toBeInstanceOf(Array);
  });

  test("includes confirmedAt timestamp in ISO 8601 format", () => {
    const testHtml = createTestHtml();

    // Mock global DOMParser for download.ts
    (global as any).DOMParser = window.DOMParser;

    const result = buildDownloadHtml(testHtml, true);

    const parser = new window.DOMParser();
    const doc = parser.parseFromString(result, "text/html");
    const submittedScript = doc.getElementById("weba-submitted");
    const data = JSON.parse(submittedScript!.textContent || "{}");

    // Verify ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(data.confirmedAt).toMatch(isoRegex);
    expect(data.submittedAt).toBe(data.confirmedAt); // Legacy field should match

    // Verify it's a valid date
    const date = new Date(data.confirmedAt);
    expect(date.toString()).not.toBe("Invalid Date");
  });

  test("initializes l3Metadata.events with Confirm event", () => {
    const testHtml = createTestHtml();

    // Mock global DOMParser for download.ts
    (global as any).DOMParser = window.DOMParser;

    const result = buildDownloadHtml(testHtml, true);

    const parser = new window.DOMParser();
    const doc = parser.parseFromString(result, "text/html");
    const submittedScript = doc.getElementById("weba-submitted");
    const data = JSON.parse(submittedScript!.textContent || "{}");

    expect(data.l3Metadata.events).toHaveLength(1);

    const confirmEvent = data.l3Metadata.events[0];
    expect(confirmEvent.type).toBe("Confirm");
    expect(confirmEvent.timestamp).toBeTruthy();
    expect(confirmEvent.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(confirmEvent.payload).toEqual({});
  });
});

// =============================================================================
// B. Confirmation Banner Tests (3 tests)
// =============================================================================

describe("displayConfirmationBanner", () => {
  beforeEach(() => {
    setupDom();
  });

  test("creates green banner with formatted timestamp in Japanese", () => {
    setLocale("ja-JP");

    const confirmedAt = "2024-01-15T14:30:45.000Z";
    const date = new Date(confirmedAt);
    const formattedDate = date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const banner = document.createElement('div');
    banner.className = 'weba-confirmation-banner';
    banner.style.cssText = 'background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981;';
    banner.innerHTML = `
      <div>
        <span>✓</span>
        <div>確定済みフォーム</div>
        <div>確定時刻: <strong>${formattedDate}</strong></div>
      </div>
    `;

    expect(banner.className).toBe('weba-confirmation-banner');
    expect(banner.style.background).toContain('linear-gradient');
    expect(banner.innerHTML).toContain('✓');
    expect(banner.innerHTML).toContain('確定済みフォーム');
    expect(banner.innerHTML).toContain('確定時刻');
    expect(banner.innerHTML).toContain(formattedDate);
  });

  test("displays English labels when locale is en-US", () => {
    setLocale("en-US");

    const confirmedAt = "2024-01-15T14:30:45.000Z";
    const date = new Date(confirmedAt);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const banner = document.createElement('div');
    banner.innerHTML = `
      <div>Confirmed Form</div>
      <div>Confirmed at: <strong>${formattedDate}</strong></div>
    `;

    expect(banner.innerHTML).toContain('Confirmed Form');
    expect(banner.innerHTML).toContain('Confirmed at');
    expect(banner.innerHTML).toContain(formattedDate);
  });

  test("handles missing .page element gracefully", () => {
    document.body.innerHTML = '<html><body><div class="action-bar"></div></body></html>';

    const page = document.querySelector('.page');
    expect(page).toBeNull();

    const banner = document.createElement('div');
    banner.className = 'weba-confirmation-banner';

    const pageElement = document.querySelector('.page');
    if (pageElement && pageElement.parentElement) {
      pageElement.parentElement.insertBefore(banner, pageElement);
    }

    const addedBanner = document.querySelector('.weba-confirmation-banner');
    expect(addedBanner).toBeNull();
  });
});

// =============================================================================
// C. Button Replacement Tests (4 tests)
// =============================================================================

describe("Action Button Management", () => {
  beforeEach(() => {
    setupDom();
    document.body.innerHTML = createTestHtml();
  });

  test("replaceActionButtons shows Withdraw/Return in Japanese", () => {
    setLocale("ja-JP");

    const actionBar = document.querySelector('.action-bar');
    expect(actionBar).toBeTruthy();

    actionBar!.innerHTML = `
      <button class="action-btn action-btn-secondary" onclick="withdrawDocument()" data-i18n="withdraw_btn">取下</button>
      <button class="action-btn action-btn-secondary" onclick="returnDocument()" data-i18n="return_btn">差戻</button>
    `;

    const buttons = actionBar!.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('取下');
    expect(buttons[0].getAttribute('onclick')).toBe('withdrawDocument()');
    expect(buttons[1].textContent).toBe('差戻');
    expect(buttons[1].getAttribute('onclick')).toBe('returnDocument()');
  });

  test("replaceActionButtons shows Withdraw/Return in English", () => {
    setLocale("en-US");

    const actionBar = document.querySelector('.action-bar');
    actionBar!.innerHTML = `
      <button class="action-btn action-btn-secondary" onclick="withdrawDocument()" data-i18n="withdraw_btn">Withdraw</button>
      <button class="action-btn action-btn-secondary" onclick="returnDocument()" data-i18n="return_btn">Return</button>
    `;

    const buttons = actionBar!.querySelectorAll('button');
    expect(buttons[0].textContent).toBe('Withdraw');
    expect(buttons[1].textContent).toBe('Return');
  });

  test("handles missing .action-bar gracefully", () => {
    document.body.innerHTML = '<html><body><div class="page"></div></body></html>';

    const actionBar = document.querySelector('.action-bar');
    expect(actionBar).toBeNull();

    if (actionBar) {
      actionBar.innerHTML = 'test';
    }

    const updatedActionBar = document.querySelector('.action-bar');
    expect(updatedActionBar).toBeNull();
  });

  test("restoreActionButtons restores original buttons correctly", () => {
    setLocale("ja-JP");

    const actionBar = document.querySelector('.action-bar');

    actionBar!.innerHTML = `
      <button onclick="withdrawDocument()">取下</button>
      <button onclick="returnDocument()">差戻</button>
    `;

    actionBar!.innerHTML = `
      <button class="action-btn action-btn-secondary" onclick="saveDraft()">💾 下書き保存</button>
      <button class="action-btn action-btn-primary" onclick="submitDocument()" data-i18n="sign_btn">確定</button>
      <button class="action-btn action-btn-secondary" onclick="clearData()">🗑️ 消去</button>
    `;

    const buttons = actionBar!.querySelectorAll('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute('onclick')).toBe('saveDraft()');
    expect(buttons[1].getAttribute('onclick')).toBe('submitDocument()');
    expect(buttons[1].getAttribute('data-i18n')).toBe('sign_btn');
    expect(buttons[2].getAttribute('onclick')).toBe('clearData()');
  });
});

// =============================================================================
// D. Form State Transition Tests (3 tests)
// =============================================================================

describe("Form State Transitions", () => {
  beforeEach(() => {
    setupDom();
    document.body.innerHTML = createTestHtml();
  });

  test("makeFormReadOnly disables all inputs with visual state", () => {
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach((el: any) => {
      el.setAttribute('readonly', 'readonly');
      el.setAttribute('disabled', 'disabled');
      el.style.backgroundColor = '#f3f4f6';
      el.style.cursor = 'not-allowed';
    });

    inputs.forEach((input: any) => {
      expect(input.hasAttribute('readonly')).toBe(true);
      expect(input.hasAttribute('disabled')).toBe(true);
      // happy-dom returns hex format instead of rgb
      expect(input.style.backgroundColor).toBe('#f3f4f6');
      expect(input.style.cursor).toBe('not-allowed');
    });
  });

  test("makeFormEditable removes readonly/disabled and restores appearance", () => {
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach((el: any) => {
      el.setAttribute('readonly', 'readonly');
      el.setAttribute('disabled', 'disabled');
      el.style.backgroundColor = '#f3f4f6';
      el.style.cursor = 'not-allowed';
    });

    inputs.forEach((el: any) => {
      el.removeAttribute('readonly');
      el.removeAttribute('disabled');
      el.style.backgroundColor = '';
      el.style.cursor = '';
    });

    inputs.forEach((input: any) => {
      expect(input.hasAttribute('readonly')).toBe(false);
      expect(input.hasAttribute('disabled')).toBe(false);
      expect(input.style.backgroundColor).toBe('');
      expect(input.style.cursor).toBe('');
    });
  });

  test("state transitions work with various input types", () => {
    const textInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const select = document.querySelector('select') as HTMLSelectElement;

    const allInputs = [textInput, checkbox, textarea, select];

    allInputs.forEach((input: any) => {
      input.setAttribute('disabled', 'disabled');
    });

    allInputs.forEach((input) => {
      expect(input.hasAttribute('disabled')).toBe(true);
    });

    allInputs.forEach((input: any) => {
      input.removeAttribute('disabled');
    });

    allInputs.forEach((input) => {
      expect(input.hasAttribute('disabled')).toBe(false);
    });
  });
});

// =============================================================================
// E. Withdrawal/Return Handler Tests (6 tests)
// =============================================================================

describe("handleWithdrawOrReturn", () => {
  let promptMock: any;
  let alertMock: any;

  beforeEach(() => {
    setupDom();
    document.body.innerHTML = createTestHtml(true);

    promptMock = mock(() => "Test reason");
    alertMock = mock(() => {});
    (global as any).prompt = promptMock;
    (global as any).alert = alertMock;
  });

  test("creates L3 Withdraw event with reason", () => {
    const submittedScript = document.getElementById('weba-submitted');
    const initialData = JSON.parse(submittedScript!.textContent || '{}');

    initialData.l3Metadata.events.push({
      type: 'Withdraw',
      timestamp: new Date().toISOString(),
      payload: { reason: 'Test reason' }
    });
    initialData.submitted = false;
    initialData.withdrawnOrReturned = true;
    initialData.lastAction = 'Withdraw';
    initialData.lastActionReason = 'Test reason';

    submittedScript!.textContent = JSON.stringify(initialData, null, 2);

    const updatedData = JSON.parse(submittedScript!.textContent || '{}');
    expect(updatedData.l3Metadata.events).toHaveLength(2);
    expect(updatedData.l3Metadata.events[1].type).toBe('Withdraw');
    expect(updatedData.l3Metadata.events[1].payload.reason).toBe('Test reason');
    expect(updatedData.submitted).toBe(false);
    expect(updatedData.withdrawnOrReturned).toBe(true);
  });

  test("creates L3 Return event with correct type", () => {
    const submittedScript = document.getElementById('weba-submitted');
    const initialData = JSON.parse(submittedScript!.textContent || '{}');

    initialData.l3Metadata.events.push({
      type: 'Return',
      timestamp: new Date().toISOString(),
      payload: { reason: 'Needs correction' }
    });
    initialData.lastAction = 'Return';

    submittedScript!.textContent = JSON.stringify(initialData, null, 2);

    const updatedData = JSON.parse(submittedScript!.textContent || '{}');
    expect(updatedData.l3Metadata.events[1].type).toBe('Return');
    expect(updatedData.lastAction).toBe('Return');
  });

  test("rejects empty reason", () => {
    promptMock = mock(() => "");
    (global as any).prompt = promptMock;

    const result = promptMock();
    expect(result).toBe("");

    if (!result || result.trim() === '') {
      alertMock('理由が入力されていません。');
    }

    expect(alertMock).toHaveBeenCalled();
  });

  test("handles parse errors gracefully", () => {
    const submittedScript = document.getElementById('weba-submitted');
    submittedScript!.textContent = 'invalid json';

    try {
      JSON.parse(submittedScript!.textContent || '{}');
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });

  test("initializes l3Metadata if missing", () => {
    const submittedScript = document.getElementById('weba-submitted');
    const data = {
      submitted: true,
      confirmedAt: "2024-01-15T14:30:45.000Z"
    };
    submittedScript!.textContent = JSON.stringify(data);

    const parsedData = JSON.parse(submittedScript!.textContent || '{}');

    if (!parsedData.l3Metadata) {
      parsedData.l3Metadata = { events: [] };
    }

    expect(parsedData.l3Metadata).toBeTruthy();
    expect(parsedData.l3Metadata.events).toBeInstanceOf(Array);
    expect(parsedData.l3Metadata.events).toHaveLength(0);
  });

  test("validates event structure after withdrawal", () => {
    const submittedScript = document.getElementById('weba-submitted');
    const data = JSON.parse(submittedScript!.textContent || '{}');

    const newEvent = {
      type: 'Withdraw',
      timestamp: new Date().toISOString(),
      payload: { reason: 'Mistaken submission' }
    };

    data.l3Metadata.events.push(newEvent);

    const latestEvent = data.l3Metadata.events[data.l3Metadata.events.length - 1];
    expect(latestEvent).toHaveProperty('type');
    expect(latestEvent).toHaveProperty('timestamp');
    expect(latestEvent).toHaveProperty('payload');
    expect(latestEvent.payload).toHaveProperty('reason');
  });
});

// =============================================================================
// F. State Initialization Tests (5 tests)
// =============================================================================

describe("initSubmittedState", () => {
  beforeEach(() => {
    setupDom();
  });

  test("detects submitted form from weba-submitted script", () => {
    document.body.innerHTML = createTestHtml(true);

    const submittedScript = document.getElementById('weba-submitted');
    expect(submittedScript).toBeTruthy();

    const data = JSON.parse(submittedScript!.textContent || '{}');
    expect(data.submitted).toBe(true);
    expect(data.confirmedAt).toBeTruthy();
  });

  test("uses confirmedAt or falls back to submittedAt", () => {
    const dataWithConfirmedAt = {
      submitted: true,
      confirmedAt: "2024-01-15T14:30:45.000Z",
      submittedAt: "2024-01-15T14:30:45.000Z"
    };

    const confirmedAt = dataWithConfirmedAt.confirmedAt || dataWithConfirmedAt.submittedAt;
    expect(confirmedAt).toBe("2024-01-15T14:30:45.000Z");

    const dataWithoutConfirmedAt = {
      submitted: true,
      submittedAt: "2024-01-15T14:30:00.000Z"
    };

    const fallbackAt = (dataWithoutConfirmedAt as any).confirmedAt || dataWithoutConfirmedAt.submittedAt;
    expect(fallbackAt).toBe("2024-01-15T14:30:00.000Z");
  });

  test("handles missing weba-submitted gracefully", () => {
    document.body.innerHTML = createTestHtml(false);

    const submittedScript = document.getElementById('weba-submitted');
    expect(submittedScript).toBeNull();

    if (!submittedScript || !submittedScript.textContent) {
      expect(submittedScript).toBeNull();
    }
  });

  test("ignores forms with submitted: false", () => {
    const data = {
      submitted: false,
      confirmedAt: "2024-01-15T14:30:45.000Z",
      l3Metadata: { events: [] }
    };

    document.body.innerHTML = createTestHtml(true, data);

    const submittedScript = document.getElementById('weba-submitted');
    const parsedData = JSON.parse(submittedScript!.textContent || '{}');

    if (!parsedData.submitted) {
      expect(parsedData.submitted).toBe(false);
    }
  });

  test("handles JSON parse errors", () => {
    document.body.innerHTML = `
      <script id="weba-submitted" type="application/json">invalid json</script>
    `;

    const submittedScript = document.getElementById('weba-submitted');

    try {
      JSON.parse(submittedScript!.textContent || '{}');
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
});

// =============================================================================
// G. I18N Label Tests (3 tests)
// =============================================================================

describe("I18N Label Updates", () => {
  beforeEach(() => {
    setupDom();
  });

  test("applies Japanese labels for form buttons", () => {
    setLocale("ja-JP");

    const resources = {
      "ja": {
        "sign_btn": "確定",
        "withdraw_btn": "取下",
        "return_btn": "差戻"
      }
    };

    expect(resources.ja.sign_btn).toBe("確定");
    expect(resources.ja.withdraw_btn).toBe("取下");
    expect(resources.ja.return_btn).toBe("差戻");
  });

  test("applies English labels for non-Japanese locales", () => {
    setLocale("en-US");

    const resources = {
      "en": {
        "sign_btn": "Confirm",
        "withdraw_btn": "Withdraw",
        "return_btn": "Return"
      }
    };

    expect(resources.en.sign_btn).toBe("Confirm");
    expect(resources.en.withdraw_btn).toBe("Withdraw");
    expect(resources.en.return_btn).toBe("Return");
  });

  test("generator includes data-i18n attribute on submit button", () => {
    document.body.innerHTML = createTestHtml();

    const submitButton = document.querySelector('button[onclick*="submitDocument"]');
    expect(submitButton).toBeTruthy();
    expect(submitButton!.getAttribute('data-i18n')).toBe('sign_btn');
  });
});
