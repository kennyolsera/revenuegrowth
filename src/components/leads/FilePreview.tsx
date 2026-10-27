"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Warning as AlertTriangle, DownloadSimple as Download, FileXls as FileSpreadsheet, FileText, PresentationChart as Presentation, MagnifyingGlass as Search, File as FileIcon } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { fileKind, formatBytes, KIND_LABEL, LEADS_MAX_BYTES, type FileKind } from "@/lib/files/fileKind";
import type { PptxDocument } from "@/lib/files/pptx";

/**
 * In-browser preview for Data Leads files (ADR-004). The file is downloaded with
 * the signed-in user's session (storage RLS applies) and rendered locally; it is
 * never sent to a third-party viewer.
 */

type LoadState =
  | { status: "loading" }
  | { status: "ready"; blob: Blob }
  | { status: "too_large"; size: number }
  | { status: "error"; message: string };

export const KIND_ICON: Record<FileKind, React.ComponentType<{ className?: string }>> = {
  spreadsheet: FileSpreadsheet,
  pdf: FileText,
  word: FileText,
  powerpoint: Presentation,
  other: FileIcon,
};

export function FilePreview({
  open,
  onClose,
  bucket,
  fileName,
  storagePath,
  onDownload,
}: {
  open: boolean;
  onClose: () => void;
  bucket: string;
  fileName: string;
  storagePath: string;
  onDownload: () => void;
}) {
  const { t } = useLanguage();
  const kind = fileKind(fileName);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState({ status: "loading" });
    (async () => {
      const { data, error } = await createClient().storage.from(bucket).download(storagePath);
      if (cancelled) return;
      if (error || !data) return setState({ status: "error", message: error?.message ?? t("leads_preview_error") });
      if (data.size > LEADS_MAX_BYTES) return setState({ status: "too_large", size: data.size });
      setState({ status: "ready", blob: data });
    })().catch((e) => !cancelled && setState({ status: "error", message: e?.message ?? t("leads_preview_error") }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bucket, storagePath]);

  const Icon = KIND_ICON[kind];

  return (
    <Dialog open={open} onClose={onClose} title={fileName} width="max-w-6xl">
      <div className="-mt-1 mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-text-3">
          <Icon className="h-[14px] w-[14px]" />
          <span>{KIND_LABEL[kind]}</span>
          {state.status === "ready" && (
            <>
              <span aria-hidden>·</span>
              <span className="num">{formatBytes(state.blob.size)}</span>
            </>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={onDownload}>
          <Download className="h-3.5 w-3.5" /> {t("download")}
        </Button>
      </div>

      {state.status === "loading" && <PreviewSkeleton />}
      {state.status === "error" && <PreviewMessage tone="error" text={`${t("leads_preview_error")} ${state.message}`} />}
      {state.status === "too_large" && (
        <PreviewMessage text={t("leads_preview_too_large").replace("{size}", formatBytes(state.size))} />
      )}
      {state.status === "ready" && (
        <>
          {kind === "spreadsheet" && <SpreadsheetView blob={state.blob} />}
          {kind === "pdf" && <PdfView blob={state.blob} title={fileName} />}
          {kind === "word" && <DocxView blob={state.blob} />}
          {kind === "powerpoint" && <PptxView blob={state.blob} />}
          {kind === "other" && <PreviewMessage text={t("leads_preview_unsupported")} />}
        </>
      )}
    </Dialog>
  );
}

function PreviewSkeleton() {
  const { t } = useLanguage();
  return (
    <div role="status" aria-label={t("leads_preview_loading")} className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-6" style={{ width: `${100 - (i % 3) * 12}%` }} />
      ))}
    </div>
  );
}

function PreviewMessage({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "error" }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className="flex items-start gap-2 rounded-md border border-border bg-surface-2 p-4 text-sm text-text-2"
    >
      <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", tone === "error" ? "text-red" : "text-amber")} />
      <span>{text}</span>
    </div>
  );
}

/* ───────────────────────── Spreadsheet (xlsx / xls / csv) ───────────────────────── */

const MAX_ROWS_SHOWN = 1000;
const MAX_COLS = 60;

function SpreadsheetView({ blob }: { blob: Blob }) {
  const { t, language } = useLanguage();
  const [sheets, setSheets] = useState<{ name: string; rows: string[][] }[] | null>(null);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await blob.arrayBuffer(), { type: "array", cellDates: true });
      const parsed = wb.SheetNames.map((name) => ({
        name,
        rows: (
          XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: "", blankrows: false }) as unknown[][]
        ).map((r) => r.slice(0, MAX_COLS).map((c) => (c == null ? "" : String(c)))),
      }));
      if (!cancelled) setSheets(parsed);
    })().catch((e) => !cancelled && setError(e?.message ?? "parse error"));
    return () => {
      cancelled = true;
    };
  }, [blob]);

  const sheet = sheets?.[active];
  const header = sheet?.rows[0] ?? [];
  const body = useMemo(() => sheet?.rows.slice(1) ?? [], [sheet]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return body;
    return body.filter((r) => r.some((c) => c.toLowerCase().includes(q)));
  }, [body, query]);
  const colCount = Math.max(header.length, ...filtered.slice(0, 50).map((r) => r.length), 0);
  const nf = new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US");

  if (error) return <PreviewMessage tone="error" text={`${t("leads_preview_error")} ${error}`} />;
  if (!sheets) return <PreviewSkeleton />;
  if (!sheet || sheet.rows.length === 0) return <PreviewMessage text={t("leads_preview_empty")} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {sheets.length > 1 ? (
          <div role="tablist" aria-label="Sheets" className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-surface-3 p-0.5 scrollbar-thin">
            {sheets.map((s, i) => (
              <button
                key={s.name}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "h-6 whitespace-nowrap rounded-xs px-2.5 text-xs font-medium transition-colors",
                  i === active ? "bg-surface text-text shadow-sm" : "text-text-3 hover:text-text"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-medium text-text-3">{sheet.name}</span>
        )}
        <label className="relative">
          <span className="sr-only">{t("leads_preview_search")}</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("leads_preview_search")}
            className="h-[30px] w-60 rounded-md border border-border-strong bg-surface pl-8 pr-2.5 text-sm text-text placeholder:text-text-4 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </label>
      </div>

      <div className="max-h-[56vh] overflow-auto rounded-lg border border-border scrollbar-thin">
        <table className="w-max min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-[1] bg-surface-2">
            <tr>
              <th className="w-12 border-b border-border px-2 py-2 text-right text-xs font-medium text-text-4">#</th>
              {Array.from({ length: colCount }).map((_, c) => (
                <th key={c} className="max-w-[280px] whitespace-nowrap border-b border-border px-3 py-2 text-left text-xs font-medium text-text-2">
                  {header[c] || ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, MAX_ROWS_SHOWN).map((row, r) => (
              <tr key={r} className="border-b border-divider last:border-b-0 hover:bg-surface-2">
                <td className="num px-2 py-1.5 text-right text-xs text-text-4">{r + 1}</td>
                {Array.from({ length: colCount }).map((_, c) => {
                  const v = row[c] ?? "";
                  const numeric = /^-?[\d.,\s]+%?$/.test(v) && /\d/.test(v);
                  return (
                    <td
                      key={c}
                      title={v.length > 40 ? v : undefined}
                      className={cn("max-w-[280px] truncate px-3 py-1.5 text-text", numeric && "num text-right")}
                    >
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-4 text-sm text-text-3">{t("leads_preview_no_match")}</p>}
      </div>

      <p className="text-xs text-text-3">
        {t("leads_preview_rows_shown")
          .replace("{shown}", nf.format(Math.min(filtered.length, MAX_ROWS_SHOWN)))
          .replace("{total}", nf.format(filtered.length))}
        {query && ` · ${t("leads_preview_filtered_from").replace("{n}", nf.format(body.length))}`}
      </p>
    </div>
  );
}

/* ───────────────────────── PDF ───────────────────────── */

function PdfView({ blob, title }: { blob: Blob; title: string }) {
  const { t } = useLanguage();
  const url = useMemo(() => URL.createObjectURL(new Blob([blob], { type: "application/pdf" })), [blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div className="space-y-2">
      <iframe src={url} title={title} className="h-[64vh] w-full rounded-lg border border-border bg-surface-2" />
      <p className="text-xs text-text-3">{t("leads_preview_pdf_hint")}</p>
    </div>
  );
}

/* ───────────────────────── Word (.docx) ───────────────────────── */

function DocxView({ blob }: { blob: Blob }) {
  const { t } = useLanguage();
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    el.innerHTML = "";
    (async () => {
      const { renderAsync } = await import("docx-preview");
      await renderAsync(blob, el, undefined, {
        className: "docx",
        inWrapper: true,
        breakPages: true,
        renderHeaders: true,
        renderFooters: true,
        useBase64URL: true,
        experimental: false,
      });
      // Only allow ordinary links out of a document.
      el.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href") ?? "";
        if (!/^(https?:|mailto:|#)/i.test(href)) a.removeAttribute("href");
        else if (!href.startsWith("#")) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        }
      });
      if (!cancelled) setStatus("ready");
    })().catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [blob]);

  return (
    <div className="space-y-2">
      {status === "loading" && <PreviewSkeleton />}
      {status === "error" && <PreviewMessage tone="error" text={t("leads_preview_error")} />}
      <div ref={host} className="docx-preview-host max-h-[64vh] overflow-auto rounded-lg border border-border scrollbar-thin" hidden={status !== "ready"} />
    </div>
  );
}

/* ───────────────────────── PowerPoint (.pptx) ───────────────────────── */

function PptxView({ blob }: { blob: Blob }) {
  const { t } = useLanguage();
  const [doc, setDoc] = useState<PptxDocument | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let parsed: PptxDocument | null = null;
    (async () => {
      const { parsePptx } = await import("@/lib/files/pptx");
      parsed = await parsePptx(await blob.arrayBuffer());
      if (cancelled) parsed.dispose();
      else setDoc(parsed);
    })().catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
      parsed?.dispose();
    };
  }, [blob]);

  if (error) return <PreviewMessage tone="error" text={t("leads_preview_error")} />;
  if (!doc) return <PreviewSkeleton />;
  if (doc.slides.length === 0) return <PreviewMessage text={t("leads_preview_empty")} />;

  return (
    <div className="space-y-3">
      <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-text-2">{t("leads_preview_pptx_note")}</p>
      <ol className="max-h-[60vh] space-y-3 overflow-auto pr-1 scrollbar-thin">
        {doc.slides.map((s) => (
          <li key={s.number} className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h4 className="text-base font-semibold text-text">{s.title ?? t("leads_preview_slide").replace("{n}", String(s.number))}</h4>
              <span className="num shrink-0 font-mono text-xs text-text-3">{s.number} / {doc.slides.length}</span>
            </div>
            <div className="space-y-3">
              {s.blocks.map((b, i) => {
                if (b.type === "text")
                  return (
                    <div key={i} className="space-y-1">
                      {b.paragraphs.map((p, j) => (
                        <p key={j} className="whitespace-pre-line text-sm text-text-2" style={{ paddingLeft: p.level * 16 }}>
                          {p.level > 0 && <span aria-hidden className="mr-1.5 text-text-4">•</span>}
                          {p.text}
                        </p>
                      ))}
                    </div>
                  );
                if (b.type === "table")
                  return (
                    <div key={i} className="overflow-x-auto scrollbar-thin">
                      <table className="min-w-full border-collapse text-sm">
                        <tbody>
                          {b.rows.map((row, r) => (
                            <tr key={r} className={r === 0 ? "bg-surface-2 font-medium" : ""}>
                              {row.map((cell, c) => (
                                <td key={c} className="whitespace-pre-line border border-border px-2.5 py-1.5 text-text">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={b.src} alt="" className="max-h-72 max-w-full rounded-md border border-border object-contain" />
                );
              })}
              {s.blocks.length === 0 && !s.hasUnsupported && <p className="text-sm text-text-4">-</p>}
              {s.hasUnsupported && <p className="text-xs text-text-3">{t("leads_preview_pptx_unsupported")}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
