import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';
const packageJson = fs.readJsonSync(path.resolve('package.json'));
const VERSION = packageJson.version || 'unknown';
import { baseLayout } from './base.js';
import { getRelativePrefix } from '../utils.js';
import { parseMarkdown } from '../../form/parser.js';

export interface FormData {
    title: string;
    description?: string;
    [key: string]: any;
}

/**
 * JSONデータをサイズに応じて圧縮してスクリプトタグに変換する
 */
function compressJson(id: string, data: any): string {
    const json = JSON.stringify(data);
    if (json.length > 512) {
        const compressed = zlib.gzipSync(Buffer.from(json));
        return `<script id="${id}" type="application/x-gzip">${compressed.toString('base64')}</script>`;
    }
    return `<script id="${id}" type="application/json">${json}</script>`;
}

/**
 * JSバンドルを圧縮してスクリプトタグに変換する
 */
function compressJs(id: string, js: string): string {
    if (!js) return '';
    const compressed = zlib.gzipSync(Buffer.from(js));
    return `<script id="${id}" type="application/x-weba-js-gz">${compressed.toString('base64')}</script>`;
}

export function formLayout(params: {
    data: FormData;
    rawMarkdown: string;
    fontCss: string;
    fontFamilies: string[];
    vc?: object;
    relPath?: string;
    config?: any;
    distDir?: string;
}) {
    const { data, rawMarkdown, fontCss, fontFamilies, vc, relPath = '', config, distDir } = params;
    const { html, jsonStructure } = parseMarkdown(rawMarkdown);
    const lang = (data.lang || 'ja').toString();

    const layer1Ref =
        (data.l2_layer1_ref as string | undefined) ||
        ((vc as any)?.credentialSubject?.contentDigest
            ? `sha256:${(vc as any).credentialSubject.contentDigest}`
            : '');
    const hasL2Config = Boolean(
        data.l2_encrypt &&
        data.l2_recipient_kid &&
        data.l2_recipient_x25519 &&
        layer1Ref,
    );
    const l2Config = hasL2Config
        ? {
            enabled: true,
            recipient_kid: data.l2_recipient_kid,
            recipient_x25519: data.l2_recipient_x25519,
            recipient_pqc: data.l2_recipient_pqc,
            layer1_ref: layer1Ref,
            weba_version: data.l2_weba_version || '0.1',
            default_enabled: data.l2_encrypt_default ?? true,
            user_kid: data.l2_user_kid || 'user#sig-1',
            campaign_id: data.l2_campaign_id,
            key_policy: data.l2_key_policy,
            prekey_url: data.l2_prekey_url || config?.l2_defaults?.prekey_url,
            epoch_registry_url: data.l2_epoch_registry_url || config?.l2_defaults?.epoch_registry_url,
        }
        : null;
    const l2Keywrap = data.l2_keywrap ? data.l2_keywrap : null;

    // Embed structure for client-side logic
    const structureScript = compressJson('weba-structure', jsonStructure);
    const l2ConfigScript = l2Config ? compressJson('weba-l2-config', l2Config) : '';
    const l2KeywrapScript = l2Keywrap ? compressJson('weba-l2-keywrap', l2Keywrap) : '';

    // Embed Postal Data if any address-related fields are detected
    let postalScript = '';
    const needsPostal = rawMarkdown.match(/zip|postal|郵便|pref|都道府県|city|市区町村|市町村|town|町名|町字|address|住所/i);
    const needsL2 = l2Config || rawMarkdown.includes('weba-l2-') || rawMarkdown.includes('l2crypto');

    if (needsPostal) {
        try {
            const postalDataPath = path.resolve('shared/data/postal/postal-optimized.json.gz');
            if (fs.existsSync(postalDataPath)) {
                const b64 = fs.readFileSync(postalDataPath).toString('base64');
                postalScript = `<script id="weba-postal-data" type="application/x-gzip">${b64}</script>
                <script>window.__needsPostal = true;</script>`;
            }
        } catch (e) { console.warn('Failed to embed postal data', e); }
    }

    const l2Toggle = l2Config ? `
        <div class="l2-status-toggle no-print" style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
               <div id="l2-indicator" style="width: 12px; height: 12px; border-radius: 50%; background: #94a3b8;"></div>
               <span style="font-weight: 600; font-size: 0.9rem;" data-i18n-ja="レイヤー2保護" data-i18n-en="Layer 2 Protection">レイヤー2保護</span>
            </div>
            <label class="switch" style="position: relative; display: inline-block; width: 44px; height: 24px;">
                <input type="checkbox" id="l2-encrypt-toggle" ${l2Config.default_enabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 24px;"></span>
            </label>
        </div>
    ` : '';

    const verificationDetails = vc ? `
        <details style="margin-top: 1rem;">
            <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                <span>✓</span>
                <span data-i18n-ja="真正性情報 (VC)" data-i18n-en="Authenticity (VC)">真正性情報 (VC)</span>
                <span style="font-size: 0.7rem; background: #e6f7e6; color: #2e7d32; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: normal;">Template Signed</span>
            </summary>
            <div style="padding: 1rem 0;">
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; font-size: 0.8rem;">
                    <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; font-family: monospace;">
                        <span style="color: #64748b;">Issuer:</span> <span>${(vc as any).issuer || 'Unknown'}</span>
                        <span style="color: #64748b;">DID:</span> <span>${(vc as any).credentialSubject?.id || 'N/A'}</span>
                    </div>
                </div>
                <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.75rem; line-height: 1.4;">${JSON.stringify(vc, null, 2)}</pre>
            </div>
        </details>
    ` : '';

    const content = `
        <div class="weba-form-container">
            ${html}
            ${l2Toggle}

            <footer class="no-print" style="margin-top: 5rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.85rem;">
                <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                    <details>
                        <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                            <span style="color: #3b82f6;">ℹ️</span>
                            <span data-i18n-ja="記入内容（データ）の確認" data-i18n-en="Review Form Data">記入内容（データ）の確認</span>
                        </summary>
                        <div style="padding: 1rem 0;">
                            <pre id="json-debug" style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;"></pre>
                        </div>
                    </details>
                    ${verificationDetails}
                </div>
                <div class="no-print" style="margin-top: 1rem; color: #94a3b8; font-size: 0.75rem; display: flex; gap: 1rem;">
                    <span>v${VERSION}</span>
                    <span>Build: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}</span>
                </div>
            </footer>
        </div>
        ${structureScript}
        ${l2ConfigScript}
        ${l2KeywrapScript}
        ${postalScript}
        ${(() => {
            const scripts: string[] = [];
            const inlineScript = (name: string, id: string) => {
                const paths = [
                    distDir ? path.join(distDir, 'assets', name) : '',
                    path.resolve('dist/assets', name)
                ].filter(Boolean);
                for (const p of paths) {
                    try {
                        if (fs.existsSync(p)) {
                            scripts.push(compressJs(id, fs.readFileSync(p, 'utf-8')));
                            return true;
                        }
                    } catch (e) { }
                }
                return false;
            };
            inlineScript('form-core.js', 'weba-js-core');
            if (needsL2) inlineScript('form-l2.js', 'weba-js-l2');
            if (needsPostal) inlineScript('form-postal.js', 'weba-js-postal');
            if (data.layout === 'aggregator' || data.layout === 'report') inlineScript('form-aggregator.js', 'weba-js-aggregator');

            scripts.push('<script id="weba-bootstrap">');
            scripts.push('(async () => {');
            scripts.push('  const s = document.querySelectorAll(\'script[type="application/x-weba-js-gz"]\');');
            scripts.push('  for (const el of s) {');
            scripts.push('    try {');
            scripts.push('      const bin = atob(el.textContent.trim());');
            scripts.push('      const ui8 = new Uint8Array(bin.length);');
            scripts.push('      for (let i = 0; i < bin.length; i++) ui8[i] = bin.charCodeAt(i);');
            scripts.push('      const stream = new Blob([ui8]).stream().pipeThrough(new DecompressionStream(\'gzip\'));');
            scripts.push('      const text = await new Response(stream).text();');
            scripts.push('      const ns = document.createElement(\'script\'); ns.type = \'module\'; ns.textContent = text; document.body.appendChild(ns);');
            scripts.push('    } catch (e) { console.error("JS Boot Error", e); }');
            scripts.push('  }');
            scripts.push('  setTimeout(() => { if (window.initRuntime) window.initRuntime(); }, 1);');
            scripts.push('})();');
            scripts.push('</script>');
            return scripts.join('\n');
        })()}
    `;

    return baseLayout({
        title: data.title,
        content: content,
        fontCss,
        fontFamilies,
        lang: lang,
        relPath
    });
}

export function formReportLayout(params: {
    data: FormData;
    rawMarkdown: string;
    fontCss: string;
    fontFamilies: string[];
    relPath?: string;
    distDir?: string;
}) {
    const { data, rawMarkdown, fontCss, fontFamilies, relPath = '', distDir } = params;
    const { jsonStructure } = parseMarkdown(rawMarkdown);
    const lang = (data.lang || 'ja').toString();
    const title = data.title ? `${data.title} (集計)` : 'Web/A Form (集計)';

    const structureScript = compressJson('weba-structure', jsonStructure);

    const content = `
        <div class="weba-report-container">
            <h1>${title}</h1>
            <div id="weba-report-root">Loading Aggregator...</div>
        </div>
        ${structureScript}
        ${(() => {
            const scripts: string[] = [];
            const inlineScript = (name: string, id: string) => {
                const paths = [
                    distDir ? path.join(distDir, 'assets', name) : '',
                    path.resolve('dist/assets', name)
                ].filter(Boolean);
                for (const p of paths) {
                    if (fs.existsSync(p)) {
                        scripts.push(compressJs(id, fs.readFileSync(p, 'utf-8')));
                        return true;
                    }
                }
                return false;
            };
            inlineScript('form-core.js', 'weba-js-core');
            inlineScript('form-aggregator.js', 'weba-js-aggregator');

            scripts.push('<script id="weba-bootstrap">');
            scripts.push('(async () => {');
            scripts.push('  const s = document.querySelectorAll(\'script[type="application/x-weba-js-gz"]\');');
            scripts.push('  for (const el of s) {');
            scripts.push('    const bin = atob(el.textContent.trim());');
            scripts.push('    const ui8 = new Uint8Array(bin.length);');
            scripts.push('    for (let i = 0; i < bin.length; i++) ui8[i] = bin.charCodeAt(i);');
            scripts.push('    const stream = new Blob([ui8]).stream().pipeThrough(new DecompressionStream(\'gzip\'));');
            scripts.push('    const text = await new Response(stream).text();');
            scripts.push('    const ns = document.createElement(\'script\'); ns.textContent = text; document.body.appendChild(ns);');
            scripts.push('  }');
            scripts.push('  setTimeout(() => { if (window.initRuntime) window.initRuntime(); }, 1);');
            scripts.push('})();');
            scripts.push('</script>');
            return scripts.join('\n');
        })()}
    `;

    return baseLayout({
        title: `${data.title} (Report)`,
        content: content,
        fontCss,
        fontFamilies,
        lang: lang,
        relPath
    });
}
