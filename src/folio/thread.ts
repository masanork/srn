import * as fs from "fs-extra";
import * as path from "node:path";
import { decode } from "cbor-x";
import * as cheerio from "cheerio";

export interface ThreadNode {
    id: string;
    absPath: string;
    meta: any;
    children: ThreadNode[];
}

/**
 * Scans a directory for Web/A files and builds a thread tree.
 */
export async function buildThreadTree(historyDir: string): Promise<ThreadNode[]> {
    const files = await fs.readdir(historyDir);
    const nodes: Map<string, ThreadNode> = new Map();

    for (const file of files) {
        if (!file.endsWith(".html")) continue;
        const absPath = path.join(historyDir, file);
        const metaPath = absPath.replace(".html", ".meta.json");

        let meta: any = {};
        if (await fs.pathExists(metaPath)) {
            meta = await fs.readJson(metaPath);
        }

        // Try to extract ID from meta or from the content if possible
        const id = meta.id || file.replace(".html", "");

        nodes.set(id, {
            id,
            absPath,
            meta,
            children: []
        });
    }

    const roots: ThreadNode[] = [];
    for (const node of nodes.values()) {
        const parentId = node.meta.in_reply_to;
        if (parentId && nodes.has(parentId)) {
            nodes.get(parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return roots;
}

export function printThreadTree(nodes: ThreadNode[], indent: string = "") {
    for (const node of nodes) {
        const action = node.meta.action ? ` [${node.meta.action.toUpperCase()}]` : "";
        console.log(`${indent}└─ ${node.id}${action} (${path.basename(node.absPath)})`);
        printThreadTree(node.children, indent + "   ");
    }
}
