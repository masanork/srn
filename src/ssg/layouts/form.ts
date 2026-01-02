import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';
const packageJson = fs.readJsonSync(path.resolve('package.json'));
const VERSION = packageJson.version || 'unknown';
import { baseLayout } from './base.js';
import { getRelativePrefix } from '../utils.js';
import { parseMarkdown } from '../../form/parser.js';
import type { ManifestManager } from '../ManifestManager.ts';

export interface FormData {
    title: string;
    description?: string;
    [key: string]: any;
}



function getSharedStyle(): string {
    const p = path.resolve('shared/style.css');
    try {
        if (fs.existsSync(p)) {
            return fs.readFileSync(p, 'utf-8');
        }
    } catch { }
    return '';
}

export async function formLayout(params: {
    data: FormData;
    rawMarkdown: string;
    fontCss: string;
    fontFamilies: string[];
    vc?: object;
    relPath?: string;
    config?: any;
    distDir?: string;
    manifestManager?: ManifestManager;
    jsonStructure?: any; // Added optional structure
}) {
    const { data, rawMarkdown, fontCss, fontFamilies, vc, relPath = '', config, distDir, manifestManager } = params;
    const { html, jsonStructure: internalStructure } = parseMarkdown(rawMarkdown);
    const jsonStructure = params.jsonStructure || internalStructure;
    const lang = (data.lang || 'ja').toString();

    // Load Shared CSS
    const sharedCss = getSharedStyle();

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

    // Register structure and configs as Blobs in ManifestManager
    if (manifestManager) {
        await manifestManager.addBlob({
            id: 'weba-structure',
            content: JSON.stringify(jsonStructure),
            mediaType: 'application/json',
            description: 'Form structure metadata'
        });
        if (l2Config) {
            await manifestManager.addBlob({
                id: 'weba-l2-config',
                content: JSON.stringify(l2Config),
                mediaType: 'application/json',
                description: 'Layer 2 security configuration'
            });
        }
        if (l2Keywrap) {
            await manifestManager.addBlob({
                id: 'weba-l2-keywrap',
                content: JSON.stringify(l2Keywrap),
                mediaType: 'application/json',
                description: 'Layer 2 keywrap metadata'
            });
        }
    }

    // Manifest Injection (Postal Data)
    let postalScript = '';
    const needsPostal = jsonStructure.needsPostal || false;
    const needsLg = jsonStructure.needsLg || rawMarkdown.includes('autofill:lg');
    const needsL2 = l2Config || rawMarkdown.includes('weba-l2-') || rawMarkdown.includes('l2crypto');

    if (needsPostal) {
        try {
            const manifestPath = path.resolve('shared/data/postal/postal-manifest.json');
            const optimizedPath = path.resolve('shared/data/postal/postal-optimized.json.gz');

            if (fs.existsSync(manifestPath) && fs.existsSync(optimizedPath) && manifestManager) {
                const gzBuffer = fs.readFileSync(optimizedPath);

                // Register with ManifestManager (Unified Blob Management)
                await manifestManager.addBlob({
                    id: 'jp-postal',
                    content: gzBuffer,
                    mediaType: 'application/x-gzip',
                    fileName: 'postal-optimized.json.gz',
                    description: 'Japan Postal Code Data (Optimized)'
                });

                postalScript = `<script>window.__needsPostal = true;</script>`;
            }
        } catch (e) { console.warn('Failed to register postal blob', e); }
    }

    // Manifest Injection (LG Data)
    let lgScript = '';
    if (needsLg) {
        try {
            const manifestPath = path.resolve('shared/data/lg/lg-manifest.json');
            const optimizedPath = path.resolve('shared/data/lg/lg-optimized.json.gz');

            if (fs.existsSync(manifestPath) && fs.existsSync(optimizedPath) && manifestManager) {
                const gzBuffer = fs.readFileSync(optimizedPath);

                await manifestManager.addBlob({
                    id: 'jp-lg',
                    content: gzBuffer,
                    mediaType: 'application/x-gzip',
                    fileName: 'lg-optimized.json.gz',
                    description: 'Japan Local Government Code Data (Optimized)'
                });

                lgScript = `<script>window.__needsLg = true;</script>`;
            }
        } catch (e) { console.warn('Failed to register LG blob', e); }
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
                <span data-i18n-ja="発行元による真正性の証明" data-i18n-en="Issuer Authenticity Proof">発行元による真正性の証明</span>
                <span style="font-size: 0.7rem; background: #e6f7e6; color: #2e7d32; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: normal;">Signed Template</span>
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

    // JS Bundles registration
    const inlineScript = async (name: string, id: string) => {
        const paths = [
            distDir ? path.join(distDir, 'assets', name) : '',
            path.resolve('dist/assets', name)
        ].filter(Boolean);
        for (const p of paths) {
            try {
                if (fs.existsSync(p) && manifestManager) {
                    const buffer = fs.readFileSync(p);
                    await manifestManager.addBlob({
                        id: `js-${id}`,
                        content: buffer,
                        mediaType: 'application/javascript',
                        fileName: name,
                        description: `Client script: ${name}`
                    });
                    return true;
                }
            } catch (e) { }
        }
        return false;
    };

    await inlineScript('form-core.js', 'weba-js-core');
    if (needsL2) await inlineScript('form-l2.js', 'weba-js-l2');
    if (needsPostal) await inlineScript('form-postal.js', 'weba-js-postal');
    if (needsLg) await inlineScript('form-lg.js', 'weba-js-lg');
    if (data.layout === 'aggregator' || data.layout === 'report') await inlineScript('form-aggregator.js', 'weba-js-aggregator');

    const customStyle = data.style ? `<style>\n${data.style}\n</style>` : '';
    const customScript = data.script ? `<script>\n${data.script}\n</script>` : '';

    const content = `
        <div class="weba-form-container">
            ${customStyle}
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
        ${postalScript}
        ${lgScript}
        ${customScript}
    `;

    return baseLayout({
        title: data.title,
        content: content,
        fontCss: fontCss + (sharedCss ? `<style>${sharedCss}</style>` : ''),
        fontFamilies,
        lang: lang,
        relPath,
        includeStyleLink: false // Web/A Forms use inline CSS
    });
}

export async function formReportLayout(params: {
    data: FormData;
    rawMarkdown: string;
    fontCss: string;
    fontFamilies: string[];
    relPath?: string;
    distDir?: string;
    manifestManager?: ManifestManager;
}) {
    const { data, rawMarkdown, fontCss, fontFamilies, relPath = '', distDir, manifestManager } = params;
    const { jsonStructure } = parseMarkdown(rawMarkdown);
    const lang = (data.lang || 'ja').toString();
    const title = data.title ? `${data.title} (集計)` : 'Web/A Form (集計)';

    if (manifestManager) {
        await manifestManager.addBlob({
            id: 'weba-structure',
            content: JSON.stringify(jsonStructure),
            mediaType: 'application/json',
            description: 'Form structure metadata'
        });

        const inlineScript = async (name: string, id: string) => {
            const paths = [
                distDir ? path.join(distDir, 'assets', name) : '',
                path.resolve('dist/assets', name)
            ].filter(Boolean);
            for (const p of paths) {
                if (fs.existsSync(p)) {
                    await manifestManager.addBlob({
                        id: `js-${id}`,
                        content: fs.readFileSync(p),
                        mediaType: 'application/javascript',
                        description: `Client script: ${name}`
                    });
                    return true;
                }
            }
            return false;
        };
        await inlineScript('form-core.js', 'weba-js-core');
        await inlineScript('form-aggregator.js', 'weba-js-aggregator');
    }

    const content = `
        <div class="weba-report-container">
            <h1>${title}</h1>
            <div id="weba-report-root">Loading Aggregator...</div>
        </div>
    `;

    return baseLayout({
        title: `${data.title} (Report)`,
        content: content,
        fontCss,
        fontFamilies,
        lang: lang,
        relPath,
        includeStyleLink: false // Web/A Forms use inline CSS
    });
}