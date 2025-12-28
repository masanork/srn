
// Client-side execution entry point
import { initRuntime } from './runtime';
import { SearchEngine } from './search';

const search = new SearchEngine();
(window as any).GlobalSearch = search;

// Expose internal functions required by HTML attributes (onclick, etc.)
// These will be assigned to window by initRuntime or explicitly here if needed.
// For now, we just boot the runtime.
initRuntime();
search.init();
