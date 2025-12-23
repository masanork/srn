import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export interface SrnConfig {
    directories: {
        site: string;
        dist: string;
        content: string;
        fonts: string;
        data: string;
    };
    identity: {
        domain: string;
        path: string;
    };
    fontStyles: Record<string, string[]>;
}

const CONFIG_FILE = path.resolve(process.cwd(), 'srn.config.yaml');

export async function loadConfig(): Promise<SrnConfig> {
    if (!await fs.pathExists(CONFIG_FILE)) {
        throw new Error(`Configuration file not found: ${CONFIG_FILE}`);
    }
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return yaml.load(content) as SrnConfig;
}

export function getAbsolutePaths(config: SrnConfig) {
    const root = process.cwd();
    return {
        SITE_DIR: path.resolve(root, config.directories.site),
        DIST_DIR: path.resolve(root, config.directories.dist),
        CONTENT_DIR: path.resolve(root, config.directories.content),
        FONTS_DIR: path.resolve(root, config.directories.fonts),
        DATA_DIR: path.resolve(root, config.directories.data)
    };
}
