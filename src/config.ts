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
        schemas: string;
    };
    identity: {
        domain: string;
        path: string;
    };
    fontStyles: Record<string, string[] | string>;
}

const DEFAULT_CONFIG_FILE = path.resolve(process.cwd(), 'srn.config.default.yaml');

export async function loadConfig(): Promise<SrnConfig> {
    // 1. Determine Profile
    const profileArgIndex = process.argv.indexOf('--site');
    const profileName = profileArgIndex !== -1 ? process.argv[profileArgIndex + 1] : null;

    let configPath = path.resolve(process.cwd(), 'srn.config.yaml');
    if (profileName) {
        configPath = path.resolve(process.cwd(), 'sites', profileName, 'config.yaml');
    }

    // 2. Load Default Config (Base)
    if (!await fs.pathExists(DEFAULT_CONFIG_FILE)) {
        throw new Error(`Default configuration file not found: ${DEFAULT_CONFIG_FILE}`);
    }
    const defaultRaw = await fs.readFile(DEFAULT_CONFIG_FILE, 'utf-8');
    const config = yaml.load(defaultRaw) as SrnConfig;

    // 3. Load Site Specific Config and Merge
    if (await fs.pathExists(configPath)) {
        console.log(`Loading config from: ${configPath}`);
        const userRaw = await fs.readFile(configPath, 'utf-8');
        const userConfig = yaml.load(userRaw) as any;

        // Simple merge (one level deep for sub-objects)
        if (userConfig.directories) {
            config.directories = { ...config.directories, ...userConfig.directories };
        }
        if (userConfig.identity) {
            config.identity = { ...config.identity, ...userConfig.identity };
        }
        if (userConfig.fontStyles) {
            config.fontStyles = { ...config.fontStyles, ...userConfig.fontStyles };
        }
    } else if (profileName) {
        throw new Error(`Profile configuration not found: ${configPath}`);
    }

    return config;
}

export function getAbsolutePaths(config: SrnConfig) {
    const root = process.cwd();
    return {
        SITE_DIR: path.resolve(root, config.directories.site),
        DIST_DIR: path.resolve(root, config.directories.dist),
        CONTENT_DIR: path.resolve(root, config.directories.content),
        FONTS_DIR: path.resolve(root, config.directories.fonts),
        DATA_DIR: path.resolve(root, config.directories.data),
        SCHEMAS_DIR: path.resolve(root, config.directories.schemas)
    };
}
