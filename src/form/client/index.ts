// Client-side execution entry point (Core Bundle)
import { initRuntime } from './runtime';
import { SearchEngine } from './search';

const search = new SearchEngine();
(window as any).GlobalSearch = search;
(window as any).SearchEngine = search;

// Boot the core runtime
initRuntime();

// Initialize SearchEngine asynchronously
search.init().catch(err => console.error('Failed to initialize SearchEngine:', err));
