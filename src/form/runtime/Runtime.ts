/**
 * Form Runtime - Core runtime for plugin system
 *
 * Provides event delegation, plugin management, and core APIs.
 */

import type {
    FormRuntime as IFormRuntime,
    FormEvent,
    EventHandler,
    PluginInitResult
} from './types.js';
import { Calculator } from '../client/calculator.js';
import { DataManager } from '../client/data.js';
import { UIManager } from '../client/ui.js';

/**
 * Form Runtime implementation
 */
export class FormRuntime implements IFormRuntime {
    private eventHandlers: Map<FormEvent, Set<EventHandler>> = new Map();
    private delegatedListeners: Map<FormEvent, (e: Event) => void> = new Map();
    private pluginErrors: Map<string, Error[]> = new Map();

    // Core managers (legacy compatibility)
    private calc: Calculator;
    private dm: DataManager;
    private uim: UIManager;

    constructor() {
        this.calc = new Calculator();
        this.dm = new DataManager();
        this.uim = new UIManager(this.calc, this.dm);
    }

    /**
     * Register event listener with delegation
     */
    on(event: FormEvent, handler: EventHandler): void {
        // Initialize handler set for this event type
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
            this.setupDelegatedListener(event);
        }

        // Add handler to set
        this.eventHandlers.get(event)!.add(handler);
    }

    /**
     * Unregister event listener
     */
    off(event: FormEvent, handler: EventHandler): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    /**
     * Setup single delegated listener for event type
     */
    private setupDelegatedListener(event: FormEvent): void {
        const delegatedHandler = (e: Event) => {
            const input = e.target as HTMLInputElement;

            // Only handle INPUT elements
            if (!input || input.tagName !== 'INPUT') return;

            // Execute all registered handlers for this event
            const handlers = this.eventHandlers.get(event);
            if (!handlers) return;

            handlers.forEach(handler => {
                try {
                    handler(e, input);
                } catch (error) {
                    console.error(`[FormRuntime] Handler error in ${event} event:`, error);
                }
            });
        };

        // Register single global listener
        document.addEventListener(event, delegatedHandler);
        this.delegatedListeners.set(event, delegatedHandler);
    }

    /**
     * Set or clear error message for input
     */
    setError(input: HTMLInputElement, message: string | null): void {
        const errorId = `error-${input.id || input.name}`;
        let errorEl = document.getElementById(errorId);

        if (message) {
            // Create or update error element
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.id = errorId;
                errorEl.className = 'form-error';
                errorEl.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;';
                input.parentElement?.appendChild(errorEl);
            }
            errorEl.textContent = message;
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', errorId);
        } else {
            // Clear error
            if (errorEl) {
                errorEl.remove();
            }
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        }
    }

    /**
     * Get current form data
     */
    getData(): Record<string, any> {
        return this.dm.collectFormData();
    }

    /**
     * Trigger recalculation
     */
    recalculate(): void {
        this.calc.recalculate();
    }

    /**
     * Update field visibility
     */
    updateVisibility(): void {
        this.uim.updateVisibility();
    }

    /**
     * Get global lookup instance
     */
    getLookup(name: string): any {
        const w = window as any;

        if (name === 'postal') {
            return w.postalLookup;
        } else if (name === 'lg') {
            return w.lgLookup;
        }

        return null;
    }

    /**
     * Report plugin error (for debugging)
     */
    reportPluginError(pluginName: string, error: Error): void {
        if (!this.pluginErrors.has(pluginName)) {
            this.pluginErrors.set(pluginName, []);
        }

        this.pluginErrors.get(pluginName)!.push(error);

        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[Plugin:${pluginName}] Error:`, error);
        }
    }

    /**
     * Get plugin errors (for debugging)
     */
    getPluginErrors(): Map<string, Error[]> {
        return this.pluginErrors;
    }

    /**
     * Start the runtime (legacy compatibility)
     */
    start(): void {
        // Restore from localStorage
        this.dm.restoreFromLS();

        // Apply i18n
        this.uim.applyI18n();

        // Initialize tables
        this.uim.initTables();

        // Initial calculation
        this.calc.recalculate();

        console.log('[FormRuntime] Started');
    }

    /**
     * Cleanup
     */
    destroy(): void {
        // Remove all delegated listeners
        this.delegatedListeners.forEach((handler, event) => {
            document.removeEventListener(event, handler);
        });

        this.delegatedListeners.clear();
        this.eventHandlers.clear();
        this.pluginErrors.clear();
    }

    /**
     * Get core managers (for legacy compatibility)
     */
    getManagers() {
        return {
            calc: this.calc,
            dm: this.dm,
            uim: this.uim
        };
    }
}
