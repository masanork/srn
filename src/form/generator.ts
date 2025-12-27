/**
 * generator.ts - Legacy utility for direct HTML generation.
 * Most logic moved to SSG Layouts and Form Client.
 */
import { CLIENT_BUNDLE } from './client/embed';

export const RUNTIME_SCRIPT = CLIENT_BUNDLE;

/**
 * Initializes the runtime in a browser environment.
 * Useful for tools like Form Maker.
 */
export function initRuntime(): void {
    if (typeof window === 'undefined') return;
    if ((window as any).recalculate) {
        return;
    }
    try {
        // eslint-disable-next-line no-eval
        eval(RUNTIME_SCRIPT);
    } catch (e) {
        console.error("Failed to init runtime from bundle:", e);
    }
}