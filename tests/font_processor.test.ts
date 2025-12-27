import { describe, expect, test } from "bun:test";
import { FontProcessor } from "../src/ssg/FontProcessor";

describe("FontProcessor", () => {
  test("processPageFonts returns safe defaults for form layout", async () => {
    const config: any = {
      directories: { fonts: "shared/fonts" },
      fontStyles: { default: ["NotoSansJP-VariableFont_wght.ttf"] },
    };
    const processor = new FontProcessor(config, process.cwd());
    const result = await processor.processPageFonts(
      "<p>Hello</p>",
      { layout: "form" },
      config,
      { ed25519: { publicKey: "", secretKey: "" }, pqc: null },
      "did:example:test",
      "build-1",
      [],
    );
    expect(result.fontCss).toContain("system-ui");
    expect(result.safeFontFamilies).toEqual(["sans-serif"]);
  });

  test("resolveFontConfigs expands styles and defaults", () => {
    const config: any = {
      directories: { fonts: "shared/fonts" },
      fontStyles: {
        default: ["Base.ttf"],
        display: ["Display.ttf"],
        fancy: "display",
      },
    };
    const processor = new FontProcessor(config, process.cwd());
    const resolved = (processor as any).resolveFontConfigs(
      { font: ["display:Extra.ttf", "fancy", "Other.ttf"] },
      config,
    );
    expect(resolved.some((entry: string) => entry.startsWith("display:"))).toBe(true);
    expect(resolved.some((entry: string) => entry.startsWith("fancy:"))).toBe(true);
    expect(resolved.some((entry: string) => entry.startsWith("default:"))).toBe(true);
  });

  test("extractAllText combines html and data content", () => {
    const config: any = {
      directories: { fonts: "shared/fonts" },
      fontStyles: { default: ["Base.ttf"] },
    };
    const processor = new FontProcessor(config, process.cwd());
    const text = (processor as any).extractAllText(
      "<div>Hello <span>World</span></div>",
      { title: "Title", layout: "article", note: "Extra" },
      [],
    );
    expect(text.includes("HelloWorld")).toBe(true);
    expect(text.includes("Title")).toBe(true);
    expect(text.includes("Extra")).toBe(true);
    expect(text.includes("Read More")).toBe(true);
  });
});
