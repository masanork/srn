
export interface WebAOptions {
    title: string;
    description?: string;
    // Future: fields, security config, etc.
}

export class Generator {
    private options: WebAOptions;

    constructor(options: WebAOptions) {
        this.options = options;
    }

    /**
     * Generates the pure Web/A HTML string.
     * 
     * Design Goals:
     * - Single file output
     * - Minimal runtime (< 5KB targeted for core)
     * - No external requests (self-contained) by default
     */
    public generate(): string {
        const runtimeScript = this.getMinimalRuntime();
        
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.options.title}</title>
    <meta name="description" content="${this.options.description || ''}">
    <style>
        /* Minimal CSS Reset for Web/A */
        :root { font-family: sans-serif; line-height: 1.5; }
        body { margin: 0; padding: 2rem; max-width: 800px; margin: 0 auto; }
        .weba-container { border: 1px solid #ccc; padding: 1rem; border-radius: 4px; }
    </style>
</head>
<body>
    <header>
        <h1>${this.options.title}</h1>
    </header>
    
    <main class="weba-container">
        <!-- Web/A Form Content will go here -->
        <p>Web/A Core Content (Placeholder)</p>
    </main>

    <script>
        ${runtimeScript}
    </script>
</body>
</html>`;
    }

    private getMinimalRuntime(): string {
        // In the future, this will be read from a separate file or generated.
        // For now, inline the absolute minimum JS.
        return `
            (function() {
                console.log("Web/A Lite Runtime initialized.");
                // TODO: Implement lightweight L2 crypto hook
            })();
        `;
    }
}
