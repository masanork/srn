import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import zlib from 'zlib';
import type { L1Manifest, MasterDataRef } from "@srn/core";

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

        // 重複チェック（digestベース）
        const existingByDigest = this.blobs.find(b => b.digest === digest);
        if (existingByDigest) return existingByDigest;

        // ID重複チェック（警告のみ、異なるコンテンツの場合）
        const existingById = this.blobs.find(b => b.id === params.id);
        if (existingById && existingById.digest !== digest) {
            console.warn(`[ManifestManager] Warning: Duplicate ID "${params.id}" with different content`);
            console.warn(`  Existing: ${existingById.description} (${existingById.size} bytes)`);
            console.warn(`  New: ${params.description} (${buffer.length} bytes)`);
        }

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
                `#weba-blob-${digest.split(':')[1]}`,
                `./${relativePath}`
            ],
            ...(params.description ? { description: params.description } : {})
        };

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
            'text/plain': '.txt',
            'application/wasm': '.wasm'
        };
        return map[mime] || '.bin';
    }

    getBlobs(): MasterDataRef[] {
        return this.blobs;
    }

    /**
     * マニフェストオブジェクトを取得する（署名や検証用）
     */
    getManifestObject(templateDigest: string = ''): L1Manifest {
        return {
            templateDigest,
            blobs: this.blobs.map(b => {
                const { _content, ...rest } = b as any;
                return rest;
            }),
            createdAt: new Date().toISOString()
        };
    }

    generateInjectionHtml(templateDigest: string = ''): string {
        const manifest = this.getManifestObject(templateDigest);

        let html = '\n<!-- Web/A L1 Manifest & Blobs -->\n';
        html += '<script>window.__WEBA_MANIFEST = ' + JSON.stringify(manifest) + ';</script>\n';

        // Deduplicate blobs by digest to prevent duplicate injection
        const injectedDigests = new Set<string>();

        for (const blob of this.blobs) {
            const b = blob as any;
            if (!b.urls || b.urls.length === 0) {
                console.warn(`[ManifestManager] Blob ${b.id} has no URLs, skipping injection`);
                continue;
            }

            // Skip if already injected
            if (injectedDigests.has(b.digest)) {
                continue;
            }
            injectedDigests.add(b.digest);

            const id = b.urls[0].substring(1);
            html += '<script id="' + id + '" type="' + b.mediaType + '">' + b._content + '</script>\n';
        }

        // JS/Font Activation Runtime (ESM)
        const runtimeJs = `
(async function() {
  const m = window.__WEBA_MANIFEST;
  if (!m || !m.blobs) return;

  // NOTE: Node.js shims removed (2025-01-04) after bundle optimization.
  // Bundle now uses native browser APIs (Uint8Array, atob, btoa) with feature detection fallbacks.
  // All bundled code (cbor-x, encoding.ts) gracefully falls back when Buffer/process are unavailable.
  
  const processBlob = async (b) => {
    const el = document.getElementById('weba-blob-' + b.digest.split(':')[1]);
    if (!el) return null;

    const bin = atob(el.textContent.trim());
    const ui8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) ui8[i] = bin.charCodeAt(i);
    
    if (b.mediaType === 'application/x-gzip' || b.id.endsWith('.gz')) {
      const stream = new Blob([ui8]).stream().pipeThrough(new DecompressionStream('gzip'));
      return await new Response(stream).arrayBuffer();
    }
    return ui8.buffer;
  };

  const sortedBlobs = [...m.blobs].sort((a, b) => {
    const score = (type) => type.includes('font') ? 1 : (type.includes('wasm') ? 2 : 3);
    return score(a.mediaType) - score(b.mediaType);
  });

  for (const b of sortedBlobs) {
    if (b.mediaType.includes('font') || b.id.startsWith('font-')) {
      const data = await processBlob(b);
      if (!data) continue;
      const family = b.id.replace('font-', '');
      const blobUrl = URL.createObjectURL(new Blob([data], {type: 'font/woff2'}));
      const css = "@font-face { font-family: '" + family + "'; src: url('" + blobUrl + "') format('woff2'); font-display: swap; }";
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    } else if (b.mediaType.includes('javascript') || b.id.startsWith('js-')) {
      const data = await processBlob(b);
      if (!data) continue;
      const code = new TextDecoder().decode(data);
      const blobUrl = URL.createObjectURL(new Blob([code], {type: 'application/javascript'}));
      const script = document.createElement('script');
      script.type = 'module';
      script.src = blobUrl;
      document.body.appendChild(script);
      if (b.id === 'js-mermaid' && window.mermaid) window.mermaid.initialize({ startOnLoad: true });
    }
  }
})();
`;

        html += '<script type="module">';
        html += runtimeJs;
        html += '\n</script>\n';

        // Clear blobs after injection to prevent accumulation
        this.blobs = [];

        return html;
    }

    /**
     * 指定されたHTML文字列から、埋め込まれたBlobスクリプトタグを削除（Prune）する
     */
    static pruneHtml(html: string): string {
        return html.replace(/<script id="weba-blob-[^>]+>.*?<\/script>\n?/g, '');
    }
}
