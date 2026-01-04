
import type { FormPlugin, FormRuntime } from '../runtime/types';

// RFC 5322準拠の実用的な正規表現
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailValidationPlugin: FormPlugin = {
    name: 'validation-email',

    // 自動検出: markdown内容に関係なく常にロード
    detect: (context) => {
        // type="email"フィールドが存在する可能性があるため常にtrue
        return true;
    },

    init: async (runtime: FormRuntime) => {
        const validateEmail = (input: HTMLInputElement): boolean => {
            const value = input.value.trim();

            // 空欄はOK（required検証が別途処理）
            if (!value) return true;

            return EMAIL_REGEX.test(value);
        };

        const handleValidation = (event: Event) => {
            const input = event.target as HTMLInputElement;

            // type="email"フィールドのみ検証
            if (input.type !== 'email') return;

            const isValid = validateEmail(input);

            if (!isValid) {
                const isJa = (navigator.language || '').toLowerCase().startsWith('ja');
                const message = isJa
                    ? '有効なメールアドレスを入力してください（例: user@example.com）'
                    : 'Please enter a valid email address (e.g., user@example.com)';
                runtime.setError(input, message);
            } else {
                runtime.setError(input, null); // エラークリア
            }
        };

        // リアルタイム検証
        runtime.on('input', handleValidation);
        runtime.on('blur', handleValidation);

        console.log('[EmailValidationPlugin] Initialized');
    }
};
