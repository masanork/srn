import { describe, expect, test } from "bun:test";
import path from "node:path";
import fs from "node:fs/promises";
import {
  bufferToDataUrl,
  getGlyphAsSvg,
  injectCustomTables,
  subsetFont,
} from "../src/core/font";

const FONT_PATH = path.resolve("shared/fonts/ReggaeOne-Regular.ttf");

async function readFontBuffer(): Promise<ArrayBuffer> {
  const buf = await fs.readFile(FONT_PATH);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function listTableTags(buffer: ArrayBuffer): string[] {
  const view = new DataView(buffer);
  const numTables = view.getUint16(4, false);
  const tags: string[] = [];
  for (let i = 0; i < numTables; i++) {
    const p = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(p),
      view.getUint8(p + 1),
      view.getUint8(p + 2),
      view.getUint8(p + 3),
    );
    tags.push(tag);
  }
  return tags;
}

describe("core/font", () => {
  test("bufferToDataUrl returns data URL", () => {
    const buf = Buffer.from([1, 2, 3]);
    const url = bufferToDataUrl(buf, "font/woff2");
    expect(url.startsWith("data:font/woff2;base64,")).toBe(true);
  });

  test("injectCustomTables adds new table", async () => {
    const arrayBuffer = await readFontBuffer();
    const beforeTags = listTableTags(arrayBuffer);
    expect(beforeTags.includes("TEST")).toBe(false);

    const custom = { TEST: new Uint8Array([1, 2, 3, 4]) };
    const injected = injectCustomTables(arrayBuffer, custom);
    const afterTags = listTableTags(injected);
    expect(afterTags.includes("TEST")).toBe(true);
  });

  test("subsetFont returns woff2 buffer", async () => {
    const { buffer, mimeType, ivsRecordsCount } = await subsetFont(FONT_PATH, "ABC");
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(mimeType).toBe("font/woff2");
    expect(typeof ivsRecordsCount).toBe("number");
  });

  test("getGlyphAsSvg returns svg or error", async () => {
    const svg = await getGlyphAsSvg(FONT_PATH, "gid:0");
    expect(svg.includes("<svg")).toBe(true);
    expect(svg.includes("<path")).toBe(true);

    const missing = await getGlyphAsSvg(FONT_PATH, "gid:999999");
    expect(missing.includes("Glyph not found")).toBe(true);
  });
});
