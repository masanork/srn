import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import { subsetFont, bufferToDataUrl } from '../core/font.ts';
import type { SrnConfig } from '../core/config.ts';
import { createCoseVC } from '../core/vc.ts';
import type { HybridKeys } from '../core/vc.ts';

export class FontProcessor {
    private cacheDir: string;
    private fontsDir: string;

    constructor(config: any, projectRoot: string) {
        this.cacheDir = path.join(projectRoot, '.cache', 'fonts');
        this.fontsDir = path.resolve(projectRoot, config.directories.fonts);
    }

    async init() {
        await fs.ensureDir(this.cacheDir);
    }

    private getHash(inputs: string[]): string {
        return crypto.createHash('sha256').update(inputs.join('|')).digest('hex');
    }

    async processPageFonts(
        htmlContent: string,
        data: any,
        config: SrnConfig,
        currentKeys: HybridKeys,
        siteDid: string,
        buildId: string,
        allPages: any[] = []
    ): Promise<{ fontCss: string, safeFontFamilies: string[] }> {

        if (process.env.NODE_ENV === 'test' || data.layout === 'form') {
            return {
                fontCss: `
<style>
body {
  font-family: system-ui, -apple-system, sans-serif;
}
</style>`,
                safeFontFamilies: ['sans-serif']
            };
        }

        const fullText = this.extractAllText(htmlContent, data, allPages);
        const fontConfigs = this.resolveFontConfigs(data, config);

        let fontCss = '';
        const styleMap: Record<string, string[]> = {};
        const fontRequestMap = new Map<string, Set<number | undefined>>();
        const ivsSupportCountByFamily = new Map<string, number>();

        const getBaseName = (fname: string) => 'Srn-' + path.basename(fname, path.extname(fname)).replace(/[^a-zA-Z0-9]/g, '');

        for (const cfg of fontConfigs) {
            let styleName = 'default';
            let fileListStr = cfg;
            if (cfg.includes(':')) {
                const parts = cfg.split(':');
                styleName = (parts[0] || '').trim();
                fileListStr = parts.slice(1).join(':').trim();
            }
            const files = fileListStr.split(',').map(s => s.trim()).filter(s => s);
            if (!styleMap[styleName]) styleMap[styleName] = [];

            const targetWeight = styleName === 'logo' ? 900 : undefined;

            for (const file of files) {
                const familyName = getBaseName(file) + (targetWeight ? `W${targetWeight}` : '');
                styleMap[styleName]?.push(familyName);

                if (!fontRequestMap.has(file)) fontRequestMap.set(file, new Set());
                fontRequestMap.get(file)?.add(targetWeight);
            }
        }

        for (const [fontName, weights] of fontRequestMap.entries()) {
            for (const targetWeight of weights) {
                const fontPath = path.join(this.fontsDir, fontName);
                if (!await fs.pathExists(fontPath)) continue;

                const fontFamilyName = getBaseName(fontName) + (targetWeight ? `W${targetWeight}` : '');
                const cacheKey = this.getHash([fontPath, fullText, buildId, targetWeight?.toString() || 'default']);
                const cachePath = path.join(this.cacheDir, `${cacheKey}.woff2`);
                const cssCachePath = path.join(this.cacheDir, `${cacheKey}.css`);

                let dataUrl: string;
                let ivsRecordsCount: number;

                if (await fs.pathExists(cachePath) && await fs.pathExists(cssCachePath)) {
                    const buffer = await fs.readFile(cachePath);
                    dataUrl = bufferToDataUrl(buffer, 'font/woff2');
                    ivsRecordsCount = parseInt(await fs.readFile(cssCachePath, 'utf-8'));
                } else {
                    console.log(`  Subsetting font: ${fontName} ${targetWeight ? `(Weight: ${targetWeight})` : ''} (Cache Miss)`);
                    const { rawSfnt: initialSfnt, ivsRecordsCount: ivsCount } = await subsetFont(fontPath, fullText, undefined, targetWeight);
                    ivsRecordsCount = ivsCount;

                    const assetHash = crypto.createHash('sha256').update(initialSfnt).digest('hex');
                    const provenanceClaim = {
                        type: "FontProvenance",
                        name: fontName,
                        weight: targetWeight,
                        hash: assetHash,
                        buildId: buildId,
                        timestamp: new Date().toISOString()
                    };
                    const provenanceVc = await createCoseVC(provenanceClaim, currentKeys, siteDid, buildId);

                    const { buffer } = await subsetFont(fontPath, fullText, {
                        'SRNC': provenanceVc.cbor
                    }, targetWeight);

                    await fs.writeFile(cachePath, buffer);
                    await fs.writeFile(cssCachePath, ivsRecordsCount.toString());
                    dataUrl = bufferToDataUrl(buffer, 'font/woff2');
                }

                fontCss += `
<style>
@font-face {
  font-family: '${fontFamilyName}';
  src: url('${dataUrl}') format('woff2');
  font-display: swap;
}
</style>
`;
                ivsSupportCountByFamily.set(fontFamilyName, ivsRecordsCount);
            }
        }

        const anyIvsSupport = Array.from(ivsSupportCountByFamily.values()).some(count => count > 0);
        if (anyIvsSupport) {
            const reorderStackForIvs = (stack: string[]) => {
                return stack
                    .map((name, index) => ({ name, index, score: ivsSupportCountByFamily.get(name) ?? 0 }))
                    .sort((a, b) => (a.score !== b.score) ? b.score - a.score : a.index - b.index)
                    .map(entry => entry.name);
            };
            for (const [styleName, stack] of Object.entries(styleMap)) {
                styleMap[styleName] = reorderStackForIvs(stack);
            }
        }

        const defaultStack = styleMap['default'] || [];
        const safeDefaultStack = defaultStack.map(f => `'${f}'`);

        let utilityCss = `<style>
`;
        for (const [styleName, stack] of Object.entries(styleMap)) {
            if (styleName === 'default') continue;
            const quotedStack = stack.map(f => `'${f}'`);
            const stackStr = [...quotedStack, ...safeDefaultStack, 'serif'].join(', ');
            utilityCss += `.font-${styleName} { font-family: ${stackStr} !important; }
`;
        }
        utilityCss += '</style>';

        const safeFontFamilies = [...defaultStack, 'serif'];
        const fontFamilyCss = safeFontFamilies.map(f => ['serif', 'sans-serif', 'monospace'].includes(f) ? f : `'${f}'`).join(', ');

        fontCss += utilityCss + `
<style>
body { font-family: ${fontFamilyCss}; font-weight: 450; }
</style>
`;

        return { fontCss, safeFontFamilies };
    }

    private extractAllText(html: string, data: any, allPages: any[] = []): string {
        const textFromObj = (obj: any): string => {
            if (typeof obj === 'string') return obj;
            if (Array.isArray(obj)) return obj.map(textFromObj).join('');
            if (typeof obj === 'object' && obj !== null) return Object.values(obj).map(textFromObj).join('');
            return '';
        };
        const bodyText = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '');

        let extraText = "Read More → ログイン 検索 設定 Home Back Next Profile More Articles";

        if (data.layout === 'blog') {
            // For blog layout, we list other articles, so we need their titles and descriptions
            for (const page of allPages) {
                if (page.layout === 'article' && !page.isSystem && page.path !== 'index.html') {
                    extraText += (page.title || '') + (page.description || '') + (page.date || '') + (page.author || '') + (page.excerptText || '');
                }
            }
        }

        return (data.title || '') + bodyText + textFromObj(data) + extraText;
    }

    private resolveFontConfigs(data: any, config: SrnConfig): string[] {
        const resolveStyleFiles = (styleName: string, seen = new Set<string>()): string[] => {
            if (seen.has(styleName)) return [];
            seen.add(styleName);
            const entry = config.fontStyles[styleName];
            if (!entry) return [];
            if (Array.isArray(entry)) return entry;
            return resolveStyleFiles(entry, seen);
        };

        let rawConfigs = data.font ? (Array.isArray(data.font) ? data.font : [data.font]) : [];
        let fontConfigs: string[] = [];
        let hasDefault = false;
        let defaultFromFont: string | null = null;

        for (const cfgRaw of rawConfigs) {
            const cfg = String(cfgRaw).trim();
            if (!cfg) continue;

            let matched = false;
            for (const sName of Object.keys(config.fontStyles)) {
                if (cfg === sName || cfg.startsWith(`${sName}:`)) {
                    const extra = cfg.startsWith(`${sName}:`) ? cfg.slice(sName.length + 1).split(',').map((s: string) => s.trim()) : [];
                    const files = [...resolveStyleFiles(sName), ...extra].join(',');
                    fontConfigs.push(`${sName}:${files}`);
                    if (!defaultFromFont && sName !== 'default') defaultFromFont = sName;
                    if (sName === 'default') hasDefault = true;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                fontConfigs.push(`default:${cfg}`);
                hasDefault = true;
            }
        }

        if (!hasDefault) {
            if (defaultFromFont) {
                const def = resolveStyleFiles(defaultFromFont);
                fontConfigs.unshift(`default:${def.length > 0 ? def.join(',') : 'NotoSansJP-VariableFont_wght.ttf'}`);
            } else {
                const def = resolveStyleFiles('default');
                fontConfigs.push(`default:${def.length > 0 ? def.join(',') : 'NotoSansJP-VariableFont_wght.ttf'}`);
            }
        }
        return fontConfigs;
    }
}