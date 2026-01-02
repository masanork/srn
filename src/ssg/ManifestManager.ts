import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import zlib from 'zlib';
import type { L1Manifest, MasterDataRef } from '../core/weba-manifest.ts';

export class ManifestManager {
    private blobs: MasterDataRef[] = [];
    private distDir: string;
    private dataDir: string;

    constructor(distDir: string) {
        this.distDir = distDir;
        this.dataDir = path.join(distDir, 'data');
    }

    /**
     * Blobを登録し、ファイルを保存する
     */
    async addBlob(params: {
        id: string;
        content: Buffer | string;
        mediaType: string;
        fileName?: string;
        description?: string;
    }): Promise<MasterDataRef> {
        let buffer = Buffer.isBuffer(params.content) ? params.content : Buffer.from(params.content);
        let mediaType = params.mediaType;

        // Auto-compress large text/json data if not already compressed
        const isTextual = mediaType.includes('json') || mediaType.includes('javascript') || mediaType.includes('text');
        const isAlreadyCompressed = mediaType.includes('gzip') || mediaType.includes('woff2');
        
        if (buffer.length > 512 && isTextual && !isAlreadyCompressed) {
            buffer = zlib.gzipSync(buffer);
            mediaType = 'application/x-gzip';
        }

        const digest = `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;
        
        // 重複チェック（既に同じDigestのBlobがあればそれを返す）
        const existing = this.blobs.find(b => b.digest === digest);
        if (existing) return existing;

        const ext = params.fileName ? path.extname(params.fileName) : this.getExtension(mediaType);
        const name = params.fileName || `${digest.split(':')[1]}${ext}`;
        const relativePath = `data/blobs/${name}`;
        const fullPath = path.join(this.distDir, relativePath);

        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, buffer);

        const ref: MasterDataRef = {
            id: params.id,
            digest,
            mediaType: mediaType,
            size: buffer.length,
            urls: [
                `#weba-blob-${digest.split(':')[1]}`, // Primary: DOM内参照
                `./${relativePath}`                   // Secondary: 外部URL
            ],
            description: params.description
        };

        // Base64化して内部保持
        (ref as any)._content = buffer.toString('base64');
        
        this.blobs.push(ref);
        return ref;
    }

    private getExtension(mime: string): string {
        const map: Record<string, string> = {
            'font/woff2': '.woff2',
            'application/json': '.json',
            'application/javascript': '.js',
            'application/x-gzip': '.gz',
            'text/plain': '.txt'
        };
        return map[mime] || '.bin';
    }

    /**
     * 現在登録されている全Blobのリストを取得
     */
    getBlobs(): MasterDataRef[] {
        return this.blobs;
    }

    /**
     * HTMLに注入するためのマニフェストデータと埋め込みスクリプトを生成
     */
    generateInjectionHtml(): string {
        if (this.blobs.length === 0) return '';

        const manifest = {
            blobs: this.blobs.map(b => {
                const { _content, ...rest } = b as any;
                return rest;
            })
        };

        let html = `\n<!-- Web/A L1 Manifest & Blobs -->\n`;
        html += `<script>window.__WEBA_MANIFEST = ${JSON.stringify(manifest)};</script>\n`;
        
        // Blobデータの埋め込み
        for (const blob of this.blobs) {
            const b = blob as any;
            const id = b.urls[0].substring(1);
            html += `<script id="${id}" type="${b.mediaType}">${b._content}</script>\n`;
        }

        // JS/Font Activation Runtime
        html += `<script>\n(function() {\n  const m = window.__WEBA_MANIFEST;\n  if (!m || !m.blobs) return;\n  \n  const processBlob = async (b) => {\n    const el = document.getElementById('weba-blob-' + b.digest.split(':')[1]);\n    if (!el) return null;\n\n    const bin = atob(el.textContent.trim());\n    const ui8 = new Uint8Array(bin.length);\n    for (let i = 0; i < bin.length; i++) ui8[i] = bin.charCodeAt(i);\n    \n    if (b.mediaType === 'application/x-gzip' || b.id.endsWith('.gz')) {\n      const stream = new Blob([ui8]).stream().pipeThrough(new DecompressionStream('gzip'));\n      return await new Response(stream).arrayBuffer();\n    }\n    return ui8.buffer;\n  };\n\n  m.blobs.forEach(b => {\n    if (b.mediaType.includes('font') || b.id.startsWith('font-')) {\n      processBlob(b).then(data => {\n        if (!data) return;\n        const family = b.id.replace('font-', '');\n        const blobUrl = URL.createObjectURL(new Blob([data], {type: 'font/woff2'}));\n        const css = "@font-face { font-family: '" + family + "'; src: url('" + blobUrl + "') format('woff2'); font-display: swap; }";\n        const style = document.createElement('style');\n        style.textContent = css;\n        document.head.appendChild(style);\n      });\n    } else if (b.mediaType.includes('javascript') || b.id.startsWith('js-')) {\n      processBlob(b).then(data => {\n        if (!data) return;\n        const code = new TextDecoder().decode(data);\n        const script = document.createElement('script');\n        script.textContent = code;\n        document.body.appendChild(script);\n        if (b.id === 'js-mermaid' && window.mermaid) window.mermaid.initialize({ startOnLoad: true });\n      });\n    }\n  });\n})();\n</script>\n`;

        return html;
    }
}
