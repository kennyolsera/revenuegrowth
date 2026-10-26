import JSZip from "jszip";

/**
 * Minimal, private PowerPoint reader (ADR-004): pulls each slide's title, text,
 * tables and pictures out of a .pptx in the browser, in document order.
 * It does not reproduce layout, fonts, animations, charts or SmartArt —
 * those are flagged so the viewer can say "open the file to see".
 */
export type PptxBlock =
  | { type: "text"; paragraphs: { text: string; level: number }[] }
  | { type: "table"; rows: string[][] }
  | { type: "image"; src: string };

export interface PptxSlide {
  number: number;
  title: string | null;
  blocks: PptxBlock[];
  /** Charts, SmartArt or picture formats the browser can't show. */
  hasUnsupported: boolean;
}

export interface PptxDocument {
  slides: PptxSlide[];
  /** Releases the object URLs created for slide pictures. */
  dispose: () => void;
}

const IMAGE_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
  svg: "image/svg+xml",
};

const MAX_SLIDES = 300;

function parseXml(text: string): Document {
  return new DOMParser().parseFromString(text, "application/xml");
}

/** Resolves "../media/image1.png" against "ppt/slides" → "ppt/media/image1.png". */
function resolvePath(baseDir: string, target: string): string {
  if (target.startsWith("/")) return target.slice(1);
  const parts = baseDir.split("/").filter(Boolean);
  for (const seg of target.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== "." && seg !== "") parts.push(seg);
  }
  return parts.join("/");
}

async function readRels(zip: JSZip, relsPath: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const file = zip.file(relsPath);
  if (!file) return map;
  const doc = parseXml(await file.async("string"));
  for (const rel of Array.from(doc.getElementsByTagName("Relationship"))) {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    if (id && target && rel.getAttribute("TargetMode") !== "External") map.set(id, target);
  }
  return map;
}

/** Slide paths in presentation order, falling back to file-name order. */
async function slidePaths(zip: JSZip): Promise<string[]> {
  const presFile = zip.file("ppt/presentation.xml");
  if (presFile) {
    const pres = parseXml(await presFile.async("string"));
    const rels = await readRels(zip, "ppt/_rels/presentation.xml.rels");
    const ordered = Array.from(pres.getElementsByTagName("p:sldId"))
      .map((el) => rels.get(el.getAttribute("r:id") ?? ""))
      .filter((t): t is string => !!t)
      .map((t) => resolvePath("ppt", t))
      .filter((p) => !!zip.file(p));
    if (ordered.length) return ordered;
  }
  return Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => Number(a.match(/(\d+)\.xml$/)![1]) - Number(b.match(/(\d+)\.xml$/)![1]));
}

function paragraphsOf(el: Element): { text: string; level: number }[] {
  const out: { text: string; level: number }[] = [];
  for (const p of Array.from(el.getElementsByTagName("a:p"))) {
    let text = "";
    for (const node of Array.from(p.getElementsByTagName("*"))) {
      if (node.tagName === "a:t") text += node.textContent ?? "";
      else if (node.tagName === "a:br") text += "\n";
    }
    text = text.replace(/\s+$/g, "");
    if (!text.trim()) continue;
    const lvl = Number(p.getElementsByTagName("a:pPr")[0]?.getAttribute("lvl") ?? 0);
    out.push({ text, level: Number.isFinite(lvl) ? lvl : 0 });
  }
  return out;
}

export async function parsePptx(data: ArrayBuffer): Promise<PptxDocument> {
  const zip = await JSZip.loadAsync(data);
  const urls: string[] = [];
  const slides: PptxSlide[] = [];
  const paths = (await slidePaths(zip)).slice(0, MAX_SLIDES);

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const dir = path.slice(0, path.lastIndexOf("/"));
    const name = path.slice(path.lastIndexOf("/") + 1);
    const doc = parseXml(await zip.file(path)!.async("string"));
    const rels = await readRels(zip, `${dir}/_rels/${name}.rels`);

    const slide: PptxSlide = { number: i + 1, title: null, blocks: [], hasUnsupported: false };
    const tree = doc.getElementsByTagName("p:spTree")[0];

    const walk = async (parent: Element) => {
      for (const el of Array.from(parent.children)) {
        switch (el.tagName) {
          case "p:grpSp":
            await walk(el);
            break;
          case "p:sp": {
            const ph = el.getElementsByTagName("p:ph")[0]?.getAttribute("type");
            const paragraphs = paragraphsOf(el);
            if (!paragraphs.length) break;
            if ((ph === "title" || ph === "ctrTitle") && !slide.title) {
              slide.title = paragraphs.map((p) => p.text).join(" ");
            } else if (ph !== "sldNum" && ph !== "dt" && ph !== "ftr") {
              slide.blocks.push({ type: "text", paragraphs });
            }
            break;
          }
          case "p:pic": {
            const embed = el.getElementsByTagName("a:blip")[0]?.getAttribute("r:embed");
            const target = embed ? rels.get(embed) : undefined;
            const mediaPath = target ? resolvePath(dir, target) : null;
            const ext = mediaPath ? mediaPath.slice(mediaPath.lastIndexOf(".") + 1).toLowerCase() : "";
            const mediaFile = mediaPath ? zip.file(mediaPath) : null;
            if (mediaFile && IMAGE_MIME[ext]) {
              const blob = new Blob([await mediaFile.async("arraybuffer")], { type: IMAGE_MIME[ext] });
              const src = URL.createObjectURL(blob);
              urls.push(src);
              slide.blocks.push({ type: "image", src });
            } else {
              slide.hasUnsupported = true; // e.g. EMF/WMF vector pictures
            }
            break;
          }
          case "p:graphicFrame": {
            const table = el.getElementsByTagName("a:tbl")[0];
            if (table) {
              const rows = Array.from(table.getElementsByTagName("a:tr")).map((tr) =>
                Array.from(tr.getElementsByTagName("a:tc")).map((tc) =>
                  paragraphsOf(tc)
                    .map((p) => p.text)
                    .join("\n")
                )
              );
              if (rows.length) slide.blocks.push({ type: "table", rows });
            } else {
              slide.hasUnsupported = true; // chart, SmartArt, embedded object
            }
            break;
          }
          default:
            break;
        }
      }
    };

    if (tree) await walk(tree);
    slides.push(slide);
  }

  return {
    slides,
    dispose: () => urls.forEach((u) => URL.revokeObjectURL(u)),
  };
}
