/**
 * MOM export (ADR-011): a Word file built in the browser with the Olsera logo top-left, and a
 * prefilled email draft (mailto). `docx` is imported lazily so it only loads when someone exports.
 */
import { formatDate } from "@/lib/utils";

export interface MomActionItem {
  label: string;
  pic: string;
  due_date: string;
  done: boolean;
}

export interface MomRecord {
  title: string;
  meeting_date: string;
  category?: string | null;
  merchant_partner?: string | null;
  participants?: string | null;
  discussion_points?: string | null;
  action_items?: MomActionItem[] | null;
  attachments?: { name: string }[] | null;
  created_by?: string | null;
}

type Lang = "id" | "en";

const L = {
  id: {
    heading: "Notulen Rapat (MOM)",
    date: "Tanggal",
    category: "Kategori",
    partner: "Merchant / Partner",
    participants: "Peserta",
    discussion: "Poin Diskusi",
    actions: "Action Items",
    task: "Tugas",
    due: "Tenggat",
    status: "Status",
    done: "Selesai",
    open: "Belum",
    docs: "Lampiran",
    none: "-",
    footer: "Dibuat dari ESMM Dashboard · Revenue Growth VAS",
    attachNote: "File MOM (Word) sudah terunduh: {file}. Silakan lampirkan ke email ini.",
    greeting: "Halo semua,\n\nBerikut notulen rapat kita.",
    closing: "Terima kasih.",
  },
  en: {
    heading: "Minutes of Meeting (MOM)",
    date: "Date",
    category: "Category",
    partner: "Merchant / Partner",
    participants: "Participants",
    discussion: "Discussion Points",
    actions: "Action Items",
    task: "Task",
    due: "Due",
    status: "Status",
    done: "Done",
    open: "Open",
    docs: "Attachments",
    none: "-",
    footer: "Generated from ESMM Dashboard · Revenue Growth VAS",
    attachNote: "The MOM Word file has been downloaded: {file}. Please attach it to this email.",
    greeting: "Hi all,\n\nPlease find the minutes of our meeting below.",
    closing: "Thank you.",
  },
} as const;

const OLSERA_NAVY = "1A3A7C";
const OLSERA_BLUE = "1468B3";
const RULE = "D9D6CF";
const FONT = "Arial";

export function momFileName(m: MomRecord) {
  const date = (m.meeting_date || new Date().toISOString()).slice(0, 10);
  const slug = (m.title || "MOM")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60);
  return `MOM_${date}_${slug || "Meeting"}.docx`;
}

let logoCache: ArrayBuffer | null = null;
async function loadLogo(): Promise<ArrayBuffer | null> {
  if (logoCache) return logoCache;
  try {
    const res = await fetch("/brand/olsera-logo.png", { cache: "force-cache" });
    if (!res.ok) return null;
    logoCache = await res.arrayBuffer();
    return logoCache;
  } catch {
    return null;
  }
}

/** Build the Word document for one MOM. */
export async function buildMomDocx(m: MomRecord, lang: Lang): Promise<Blob> {
  const d = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ShadingType,
    Footer,
    TableLayoutType,
  } = d;
  const t = L[lang];
  const logo = await loadLogo();

  const text = (s: string, o: Record<string, unknown> = {}) => new TextRun({ text: s, font: FONT, size: 21, ...o });
  const para = (runs: InstanceType<typeof TextRun>[], o: Record<string, unknown> = {}) =>
    new Paragraph({ children: runs, spacing: { after: 80 }, ...o });
  const heading = (s: string) =>
    new Paragraph({
      children: [text(s, { bold: true, size: 24, color: OLSERA_NAVY })],
      spacing: { before: 280, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 4 } },
    });

  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
  const line = { style: BorderStyle.SINGLE, size: 4, color: RULE };
  const gridBorders = { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line };

  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

  // Logo, top-left
  if (logo) {
    children.push(
      new Paragraph({
        children: [new ImageRun({ type: "png", data: logo, transformation: { width: 150, height: 42 } })],
        spacing: { after: 240 },
      })
    );
  } else {
    children.push(para([text("olsera", { bold: true, size: 36, color: OLSERA_NAVY })], { spacing: { after: 240 } }));
  }

  children.push(para([text(t.heading.toUpperCase(), { size: 18, color: OLSERA_BLUE, bold: true, characterSpacing: 20 })], { spacing: { after: 40 } }));
  children.push(para([text(m.title || "-", { bold: true, size: 34, color: "1D1C1A" })], { spacing: { after: 200 } }));

  // Meeting facts (label / value)
  const facts: [string, string][] = [
    [t.date, m.meeting_date ? formatDate(m.meeting_date) : t.none],
    [t.category, m.category || t.none],
    [t.partner, m.merchant_partner || t.none],
    [t.participants, m.participants || t.none],
  ];
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      columnWidths: [2200, 7160],
      borders: noBorders,
      rows: facts.map(
        ([k, v]) =>
          new TableRow({
            children: [
              new TableCell({ width: { size: 2200, type: WidthType.DXA }, children: [para([text(k, { color: "6B6A66", size: 19 })])] }),
              new TableCell({ width: { size: 7160, type: WidthType.DXA }, children: [para([text(v)])] }),
            ],
          })
      ),
    })
  );

  // Discussion points: keep the user's line breaks; "-", "•" or "*" lines become bullets
  children.push(heading(t.discussion));
  const lines = (m.discussion_points || "").split(/\r?\n/);
  if (!lines.some((l) => l.trim())) children.push(para([text(t.none)]));
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (!l.trim()) continue;
    const b = l.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    children.push(b ? new Paragraph({ children: [text(b[1])], bullet: { level: 0 }, spacing: { after: 60 } }) : para([text(l)]));
  }

  // Action items table
  children.push(heading(t.actions));
  const items = (m.action_items || []).filter((a) => a && a.label && a.label.trim());
  if (!items.length) {
    children.push(para([text(t.none)]));
  } else {
    const W = [500, 4760, 1700, 1400, 1000];
    const cell = (s: string, w: number, o: Record<string, unknown> = {}, head = false) =>
      new TableCell({
        width: { size: w, type: WidthType.DXA },
        shading: head ? { type: ShadingType.CLEAR, color: "auto", fill: "F4F3F0" } : undefined,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ children: [text(s, { size: 19, ...o })] })],
      });
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        columnWidths: W,
        borders: gridBorders,
        rows: [
          new TableRow({
            tableHeader: true,
            children: ["#", t.task, "PIC", t.due, t.status].map((h, i) => cell(h, W[i], { bold: true, color: "3A3936" }, true)),
          }),
          ...items.map(
            (a, i) =>
              new TableRow({
                children: [
                  cell(String(i + 1), W[0], { color: "6B6A66" }),
                  cell(a.label, W[1]),
                  cell(a.pic || t.none, W[2]),
                  cell(a.due_date ? formatDate(a.due_date) : t.none, W[3]),
                  cell(a.done ? t.done : t.open, W[4], { color: a.done ? "3D8E5F" : "C48A1E", bold: true }),
                ],
              })
          ),
        ],
      })
    );
  }

  const atts = (m.attachments || []).filter((a) => a?.name);
  if (atts.length) {
    children.push(heading(t.docs));
    atts.forEach((a) => children.push(new Paragraph({ children: [text(a.name)], bullet: { level: 0 }, spacing: { after: 60 } })));
  }

  const doc = new Document({
    creator: m.created_by || "ESMM Dashboard",
    title: `MOM - ${m.title || ""}`,
    styles: { default: { document: { run: { font: FONT, size: 21 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [text(t.footer, { size: 16, color: "8A867E" })] })],
          }),
        },
        children,
      },
    ],
  });
  return Packer.toBlob(doc);
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Build and download the Word file. Returns the file name. */
export async function downloadMom(m: MomRecord, lang: Lang): Promise<string> {
  const name = momFileName(m);
  saveBlob(await buildMomDocx(m, lang), name);
  return name;
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/**
 * Recipient emails from the free-text participants field: typed addresses, plus team members
 * whose full name (or first name, when unique) appears in the list.
 */
export function momRecipients(participants: string | null | undefined, members: { full_name: string | null; email: string | null }[]): string[] {
  const src = participants || "";
  const out = new Set<string>((src.match(EMAIL_RE) || []).map((e) => e.toLowerCase()));
  const parts = src
    .replace(EMAIL_RE, " ")
    .split(/[,;\n/]+|\s+&\s+|\s+(?:dan|and)\s+/i)
    .map((s) => s.replace(/\(.*?\)/g, "").trim().toLowerCase())
    .filter((s) => s.length >= 2);
  for (const p of parts) {
    const full = members.find((m) => m.email && (m.full_name || "").trim().toLowerCase() === p);
    if (full) {
      out.add(full.email!.toLowerCase());
      continue;
    }
    const byFirst = members.filter((m) => m.email && (m.full_name || "").trim().toLowerCase().split(/\s+/)[0] === p);
    if (byFirst.length === 1) out.add(byFirst[0].email!.toLowerCase());
  }
  return Array.from(out);
}

/** mailto: link with recipients, subject and a short summary. Kept under ~1,800 characters. */
export function momMailto(m: MomRecord, to: string[], fileName: string, lang: Lang): string {
  const t = L[lang];
  const date = m.meeting_date ? formatDate(m.meeting_date) : "";
  const subject = `MOM: ${m.title || "-"}${date ? ` (${date})` : ""}`;
  const items = (m.action_items || []).filter((a) => a?.label?.trim());
  const lines = [
    t.greeting,
    "",
    `${t.date}: ${date || t.none}`,
    m.merchant_partner ? `${t.partner}: ${m.merchant_partner}` : "",
    m.participants ? `${t.participants}: ${m.participants}` : "",
    "",
    items.length ? `${t.actions}:` : "",
    ...items.map((a, i) => `${i + 1}. ${a.label}${a.pic ? ` (PIC: ${a.pic}` : ""}${a.pic && a.due_date ? `, ${formatDate(a.due_date)})` : a.pic ? ")" : a.due_date ? ` (${formatDate(a.due_date)})` : ""}`),
    "",
    t.attachNote.replace("{file}", fileName),
    "",
    t.closing,
  ].filter((l, i, arr) => !(l === "" && arr[i - 1] === ""));
  let body = lines.join("\n");
  const budget = 1800 - encodeURIComponent(subject).length - to.join(",").length;
  if (encodeURIComponent(body).length > budget) {
    while (encodeURIComponent(body + "\n...").length > budget && body.length > 50) body = body.slice(0, -40);
    body += "\n...\n\n" + t.attachNote.replace("{file}", fileName);
  }
  return `mailto:${to.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
