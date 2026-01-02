import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
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
        const buffer = Buffer.isBuffer(params.content) ? params.content : Buffer.from(params.content);
        const digest = `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;
        
        // 既に同じDigestのBlobがあればそれを返す（重複排除）
        const existing = this.blobs.find(b => b.digest === digest);
        if (existing) return existing;

        const ext = params.fileName ? path.extname(params.fileName) : this.getExtension(params.mediaType);
        const name = params.fileName || `${digest.split(':')[1]}${ext}`;
        const relativePath = `data/blobs/${name}`;
        const fullPath = path.join(this.distDir, relativePath);

        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, buffer);

        const ref: MasterDataRef = {
            id: params.id,
            digest,
            mediaType: params.mediaType,
            size: buffer.length,
            urls: [
                `#weba-blob-${digest.split(':')[1]}`, // Primary: DOM埋め込み参照用ID
                `./${relativePath}`                   // Secondary: 外部取得用URL
            ],
            description: params.description
        };

        // 内部にバッファを保持（後でHTMLに埋め込むため）
        (ref as any)._content = buffer.toString('base64');
        
        this.blobs.push(ref);
        return ref;
    }

    private getExtension(mime: string): string {
        const map: Record<string, string> = {
            'font/woff2': '.woff2',
            'application/json': '.json',
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
        const manifest = {
            blobs: this.blobs.map(b => {
                const { _content, ...rest } = b as any;
                return rest;
            })
        };

        let html = `\n<!-- Web/A L1 Manifest & Blobs -->\n`;
        html += `<script>window.__WEBA_MANIFEST = ${JSON.stringify(manifest)};</script>\n`;
        
        // 実際のデータを埋め込む (Pack phase)
        for (const blob of this.blobs) {
            const b = blob as any;
            const id = b.urls[0].substring(1); // #を除去
            const type = b.mediaType === 'font/woff2' ? 'application/x-font-woff2-base64' : b.mediaType;
            html += `<script id="${id}" type="${type}">${b._content}</script>\n`;
        }

        // Font & JS Activation Script (Small runtime to handle pruned fonts/scripts)
        // If a font/script is pruned from DOM but exists in manifest, this script could potentially fetch it.
        html += `<script>
(function() {
  const m = window.__WEBA_MANIFEST;
  if (!m || !m.blobs) return;
  m.blobs.forEach(b => {
    // Fonts
    if (b.mediaType === 'font/woff2') {
      const family = b.id.replace('font-', '');
      const el = document.getElementById('weba-blob-' + b.digest.split(':')[1]);
      if (el) {
        const css = \`@font-face { font-family: '\${family}'; src: url(data:font/woff2;base64,\${el.textContent}) format('woff2'); font-display: swap; }\`;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
      }
    }
    // JavaScript (e.g. Mermaid)
    if (b.mediaType === 'application/javascript') {
      const el = document.getElementById('weba-blob-' + b.digest.split(':')[1]);
      if (el) {
        // Load from embedded
        const script = document.createElement('script');
        // We can't use textContent for binary-ish JS if it was base64 encoded.
        // ManifestManager stores _content as base64.
        // So we need to decode it to text or blob.
        // For JS, text is fine.
        try {
            const code = atob(el.textContent.trim());
            script.textContent = code;
            document.body.appendChild(script);
            
            // Post-load hooks
            if (b.id === 'js-mermaid') {
                if (window.mermaid) window.mermaid.initialize({ startOnLoad: true });
            }
        } catch(e) { console.error("Failed to load embedded JS", b.id, e); }
      }
    }
  });
})();
</script>\n`;

        return html;
    }
}
