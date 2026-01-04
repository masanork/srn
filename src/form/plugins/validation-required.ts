
import type { FormPlugin, FormRuntime } from '../runtime/types';

export const requiredValidationPlugin: FormPlugin = {
    name: 'validation-required',
    detect: (context) => {
        return context.rawMarkdown.includes('(required)');
    },
    init: async (runtime: FormRuntime) => {
        console.log('[RequiredValidationPlugin] Initializing...');

        const checkRequired = (): boolean => {
            const w = window as any;
            const structure = w.generatedJsonStructure;
            if (!structure || !structure.fields) {
                console.log('[RequiredValidationPlugin] No structure or fields found');
                return false;
            }

            const inputs = Array.from(document.querySelectorAll('input, select, textarea')) as HTMLInputElement[];
            console.log(`[RequiredValidationPlugin] Checking ${inputs.length} inputs`);

            for (const input of inputs) {
                const key = input.dataset.jsonPath || input.name;

                // Skip disabled inputs (usually hidden by show_if logic)
                if (input.disabled) continue;
                if (!key) continue;

                const fieldDef = structure.fields.find((f: any) => f.key === key);
                if (fieldDef) {
                    if (fieldDef.required) {
                        if (input.type === 'checkbox') {
                            if (!input.checked) return false;
                        } else if (input.type === 'radio') {
                            const group = document.getElementsByName(input.name);
                            let checked = false;
                            for (let i = 0; i < group.length; i++) {
                                if ((group[i] as HTMLInputElement).checked) {
                                    checked = true;
                                    break;
                                }
                            }
                            if (!checked) return false;
                        } else {
                            if (!input.value.trim()) return false;
                        }
                    }
                }
                else {
                    // console.log(`[RequiredValidationPlugin] No field definition for: ${key}`);
                }
            }
            console.log('[RequiredValidationPlugin] All required fields filled - VALID');
            return true;
        };

        const updateState = () => {
            const btn = document.getElementById('btn-submit') as HTMLButtonElement;
            if (!btn) return;

            const isValid = checkRequired();

            // Update visual classes instead of disabled attribute
            if (isValid) {
                btn.classList.remove('btn-submit-incomplete');
                btn.classList.add('btn-submit-ready');
                btn.title = '';
            } else {
                btn.classList.remove('btn-submit-ready');
                btn.classList.add('btn-submit-incomplete');
                const isJa = (navigator.language || '').toLowerCase().startsWith('ja');
                btn.title = isJa ? '必須項目が未入力です（クリックして確認）' : 'Required fields missing (click to review)';
            }

            console.log(`[RequiredValidationPlugin] Submit button state updated: isValid=${isValid}`);
        };

        // Listen for changes
        runtime.on('input', updateState);
        runtime.on('change', updateState);

        // Initial check
        setTimeout(updateState, 500);

        console.log('[RequiredValidationPlugin] Initialized');
    }
};
