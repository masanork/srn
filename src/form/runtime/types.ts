/**
 * Form Plugin System - Type Definitions
 *
 * Defines the plugin architecture for Web/A Forms.
 * Plugins provide modular functionality like autofill, validation, etc.
 */

/**
 * Form plugin interface
 */
export interface FormPlugin {
    /** Unique plugin identifier */
    name: string;

    /** Detect if this plugin should be enabled */
    detect(context: DetectionContext): boolean;

    /** Other plugins this plugin depends on */
    dependencies?: string[];

    /** Data blobs this plugin requires (e.g., 'jp-postal', 'jp-lg') */
    dataBlobs?: string[];

    /** Initialize the plugin (called after DOM ready) */
    init(runtime: FormRuntime): void | Promise<void>;

    /** Cleanup handler (optional) */
    destroy?(): void;

    /** Error handler (optional) */
    onError?(error: Error): void;
}

/**
 * Plugin detection context
 */
export interface DetectionContext {
    /** Parsed form structure */
    structure: FormStructure;

    /** Raw markdown content */
    rawMarkdown: string;

    /** Frontmatter data */
    frontmatter: Record<string, any>;
}

/**
 * Form structure (parsed from markdown)
 */
export interface FormStructure {
    '@context'?: string;
    '@type'?: string;
    name?: string;
    fields?: FormField[];
    tables?: FormTable[];
    masterData?: Record<string, any>;
    masterDataRefs?: string[];
    needsPostal?: boolean;
    needsLg?: boolean;
    [key: string]: any;
}

/**
 * Form field definition
 */
export interface FormField {
    type: string;
    name: string;
    label?: string;
    validation?: string;
    autofill?: string;
    [key: string]: any;
}

/**
 * Form table definition
 */
export interface FormTable {
    name: string;
    columns: FormField[];
    [key: string]: any;
}

/**
 * Form runtime API (available to plugins)
 */
export interface FormRuntime {
    /** Register event listener */
    on(event: FormEvent, handler: EventHandler): void;

    /** Unregister event listener */
    off(event: FormEvent, handler: EventHandler): void;

    /** Set or clear error message for an input */
    setError(input: HTMLInputElement, message: string | null): void;

    /** Get current form data */
    getData(): Record<string, any>;

    /** Trigger recalculation */
    recalculate(): void;

    /** Update field visibility based on conditions */
    updateVisibility(): void;

    /** Get global lookup instance (postal, lg, etc.) */
    getLookup(name: string): any;

    /** Report plugin error (for logging/debugging) */
    reportPluginError(pluginName: string, error: Error): void;
}

/**
 * Supported form events
 */
export type FormEvent = 'input' | 'change' | 'blur' | 'focus' | 'submit';

/**
 * Event handler function signature
 */
export type EventHandler = (event: Event, input: HTMLInputElement) => void;

/**
 * Plugin registry - maps plugin names to instances
 */
export interface PluginRegistry {
    [name: string]: FormPlugin;
}

/**
 * Plugin initialization result
 */
export interface PluginInitResult {
    success: boolean;
    pluginName: string;
    error?: Error;
}
