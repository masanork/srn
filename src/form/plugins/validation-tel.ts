
import type { FormPlugin, FormRuntime } from '../runtime/types';

// 国際電話番号対応（柔軟な正規表現）
// 日本: 090-1234-5678, 03-1234-5678
// 国際: +81-90-1234-5678
// その他: (123) 456-7890
const TEL_REGEX = /^[\d\s\-\+\(\)]+$/;
const MIN_DIGITS = 10; // 最低桁数

export const telValidationPlugin: FormPlugin = {
    name: 'validation-tel',

    detect: (context) => {
        return true; // 自動検証
    },

    init: async (runtime: FormRuntime) => {
        const validateTel = (input: HTMLInputElement): boolean => {
            const value = input.value.trim();

            // 空欄はOK
            if (!value) return true;

            // 許可文字チェック
            if (!TEL_REGEX.test(value)) return false;

            // 数字のみ抽出して桁数チェック
            const digits = value.replace(/\D/g, '');
            return digits.length >= MIN_DIGITS;
        };

        const handleValidation = (event: Event) => {
            const input = event.target as HTMLInputElement;

            // type="tel"フィールドのみ検証
            if (input.type !== 'tel') return;

            const isValid = validateTel(input);

            if (!isValid) {
                const isJa = (navigator.language || '').toLowerCase().startsWith('ja');
                const message = isJa
                    ? '有効な電話番号を入力してください（例: 090-1234-5678）'
                    : 'Please enter a valid phone number (e.g., 090-1234-5678)';
                runtime.setError(input, message);
            } else {
                runtime.setError(input, null);
            }
        };

        runtime.on('input', handleValidation);
        runtime.on('blur', handleValidation);

        console.log('[TelValidationPlugin] Initialized');
    }
};
