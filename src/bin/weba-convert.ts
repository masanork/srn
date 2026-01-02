import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';
import { LayoutManager } from '../ssg/LayoutManager.ts';
import { ManifestManager } from '../ssg/ManifestManager.ts';
import { IdentityManager } from '../ssg/IdentityManager.ts';
import { FontProcessor } from '../ssg/FontProcessor.ts';
import { bundleClientScripts } from '../ssg/index.ts'; // We'll make this exportable
import { loadConfig } from '../core/config.ts';
import { initWasm } from '../core/wasm_core.ts';
import { marked } from 'marked';

const program = new Command();

program
    .name('weba-convert')
    .description('Convert Markdown files to self-contained Web/A documents')
    .argument('<inputs...>', 'Input files or directories')
    .option('-o, --output <dir>', 'Output directory (default: same as input or ./dist)')
    .option('--site <name>', 'Site profile to use for config/fonts', 'srn')
    .action(async (inputs, options) => {
        // Resolve project root based on this script's location
        const projectRoot = path.resolve(import.meta.dirname, '../../');
        
        await initWasm();
        
        const configPath = path.resolve(projectRoot, `sites/${options.site}/config.yaml`);
        if (!await fs.pathExists(configPath)) {
            console.error(`Config not found: ${configPath}`);
            process.exit(1);
        }
        const config = await loadConfig(configPath);
        
        // Correct IdentityManager initialization based on config.yaml structure
        const dataDir = path.resolve(projectRoot, config.directories.data || `sites/${options.site}/data`);
        const distDir = options.output ? path.resolve(options.output) : path.resolve(projectRoot, 'dist', options.site);
        
        // Ensure assets are available
        const assetsDir = path.join(distDir, 'assets');
        if (!await fs.pathExists(path.join(assetsDir, 'form-core.js'))) {
            console.log("Assets missing. Bundling client scripts...");
            await bundleClientScripts(distDir);
        }

        const domain = config.identity?.domain || 'localhost';
        const sitePath = config.identity?.path || '/';
        
        const idManager = new IdentityManager(domain, sitePath, dataDir, distDir);
        await idManager.init();

        const fontProcessor = new FontProcessor(config, projectRoot);
        await fontProcessor.init();

        const layoutManager = new LayoutManager();
        
        const allInputFiles: string[] = [];
        for (const input of inputs) {
            // Stats check against CURRENT directory
            const stats = await fs.stat(input);
            if (stats.isDirectory()) {
                const found = await glob('**/*.md', { cwd: input, absolute: true });
                allInputFiles.push(...found);
            } else {
                allInputFiles.push(path.resolve(input));
            }
        }

        console.log(`Converting ${allInputFiles.length} file(s)...`);

        for (const fullPath of allInputFiles) {
            const relPath = path.basename(fullPath);
            const baseDir = path.dirname(fullPath);
            const outDir = options.output ? path.resolve(options.output) : baseDir;
            const targetPath = path.join(outDir, relPath.replace('.md', '.html'));

            console.log(`  Processing: ${relPath}`);
            
            const source = await fs.readFile(fullPath, 'utf-8');
            const { data, content } = matter(source);
            
            // Set reasonable defaults for standalone conversion
            data.layout = data.layout || 'form';
            data.embedFonts = data.embedFonts ?? true;

            const manifestManager = new ManifestManager(outDir);
            const htmlContent = await marked.parse(content) as string;

            // Process fonts
            let fontCss = '';
            let safeFontFamilies: string[] = [];
            if (data.embedFonts) {
                const fontResult = await fontProcessor.processPageFonts(
                    htmlContent, data, config, idManager.currentKeys, idManager.siteDid, idManager.buildId, [], manifestManager
                );
                fontCss = fontResult.fontCss;
                safeFontFamilies = fontResult.safeFontFamilies;
            }

            // Render
            const { html } = await layoutManager.render({
                data,
                config,
                content,
                htmlContent,
                fontCss,
                safeFontFamilies,
                allPages: [],
                idManager,
                distDir: outDir,
                relPath: relPath,
                contentDir: baseDir
            }, manifestManager);

            await fs.ensureDir(path.dirname(targetPath));
            await fs.writeFile(targetPath, html);
        }

        console.log(`Done.`);
    });

program.parse();
