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
            'text/plain': '.txt',
            'application/wasm': '.wasm'
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

        let html = `
<!-- Web/A L1 Manifest & Blobs -->
`;
        html += `<script>window.__WEBA_MANIFEST = ${JSON.stringify(manifest)};</script>
`;
        
        // Blobデータの埋め込み
        for (const blob of this.blobs) {
            const b = blob as any;
            const id = b.urls[0].substring(1);
            html += `<script id="${id}" type="${b.mediaType}">${b._content}</script>
`;
        }

        // JS/Font Activation Runtime
        html += `<script type="module">
(async function() {
  const m = window.__WEBA_MANIFEST;
  if (!m || !m.blobs) return;
  
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

  // Sort blobs: Fonts first, then WASM, then JS
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
    } else if (b.mediaType.includes('javascript') || b.id.startsWith('js-')) {      const data = await processBlob(b);
      if (!data) continue;
      const code = new TextDecoder().decode(data);
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = code;
      document.body.appendChild(script);
      if (b.id === 'js-mermaid' && window.mermaid) window.mermaid.initialize({ startOnLoad: true });
    }
  }
})();
</script>