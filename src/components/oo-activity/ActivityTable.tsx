"use client";

import { FileArrowUp as FileUp, Plus, MagnifyingGlassMinus as SearchX } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { OPTION_FIELDS, optionsFor, type ActivityOption, type ActivityRecord, type OptionColumn } from "@/lib/oo-activity";
import { OptionChipSelect } from "@/components/oo-activity/options";
import { cn } from "@/lib/utils";

type Lang = "id" | "en";

const COPY = {
  date: { id: "Tgl", en: "Date" },
  store: { id: "URL", en: "Store URL" },
  phone: { id: "Nomor telp", en: "Phone" },
  notes: { id: "Keterangan", en: "Notes" },
  minutes: { id: "Menit", en: "Min" },
  openUrl: { id: "Buka URL toko", en: "Open store URL" },
  emptyTitle: { id: "Belum ada follow up", en: "No follow-ups yet" },
  emptyBody: {
    id: "Impor sheet follow up online order (File › Download › .xlsx di Google Sheets) atau catat follow up pertama.",
    en: "Import the online order follow-up sheet (File › Download › .xlsx in Google Sheets) or log the first follow-up.",
  },
  importSheet: { id: "Impor sheet", en: "Import sheet" },
  newActivity: { id: "Follow up baru", en: "New follow-up" },
  noMatchTitle: { id: "Tidak ada yang cocok", en: "Nothing matches" },
  noMatchBody: { id: "Coba kata kunci lain atau hapus beberapa filter.", en: "Try another search or remove a filter." },
  clear: { id: "Hapus filter", en: "Clear filters" },
};

function fmtDate(iso: string | null, lang: Lang) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const sameYear = y === new Date().getFullYear();
  return dt.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { day: "2-digit", month: "short", ...(sameYear ? {} : { year: "2-digit" }) });
}

export function safeHref(url: string) {
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return `https://${u}`;
  return null; // never render javascript:, data: etc. as links
}

const TH = "sticky top-0 z-[2] h-9 whitespace-nowrap border-b border-border bg-surface-2 px-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-3";
const TD = "h-10 whitespace-nowrap border-b border-divider px-3 align-middle";

export function ActivityTable({
  rows,
  options,
  loading,
  totalRecords,
  flashId,
  language,
  onOpen,
  onChangeOption,
  onImport,
  onNew,
  onClearFilters,
}: {
  rows: ActivityRecord[];
  options: ActivityOption[];
  loading: boolean;
  totalRecords: number;
  flashId: string | null;
  language: Lang;
  onOpen: (r: ActivityRecord) => void;
  onChangeOption: (r: ActivityRecord, column: OptionColumn, id: string | null) => void;
  onImport: () => void;
  onNew: () => void;
  onClearFilters: () => void;
}) {
  const lists = OPTION_FIELDS.map((f) => ({ ...f, opts: optionsFor(options, f.field) }));
  const colCount = 5 + lists.length;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="scrollbar-thin max-h-[calc(100dvh-330px)] min-h-[300px] overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <thead>
            <tr>
              <th scope="col" className={cn(TH, "w-[76px]")}>
                {COPY.date[language]}
              </th>
              <th scope="col" className={cn(TH, "left-0 z-[3] min-w-[220px] border-r border-r-divider")} style={{ position: "sticky" }}>
                {COPY.store[language]}
              </th>
              <th scope="col" className={TH}>
                {COPY.phone[language]}
              </th>
              {lists.map((f) => (
                <th key={f.field} scope="col" className={TH}>
                  {f.label[language]}
                </th>
              ))}
              <th scope="col" className={cn(TH, "w-[64px] text-right")}>
                {COPY.minutes[language]}
              </th>
              <th scope="col" className={cn(TH, "w-full min-w-[200px]")}>
                {COPY.notes[language]}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 9 }).map((_, i) => (
                <tr key={`sk-${i}`} aria-hidden>
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className={cn(TD, j === 1 && "sticky left-0 border-r border-r-divider bg-surface")}>
                      <span
                        className="block h-3 animate-pulse rounded bg-surface-3"
                        style={{ width: j === 1 ? `${55 + ((i * 37) % 40)}%` : j === colCount - 1 ? `${30 + ((i * 23) % 50)}%` : 56, animationDelay: `${i * 60}ms` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-6 py-16">
                  {totalRecords === 0 ? (
                    <div className="mx-auto flex max-w-md flex-col items-start gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-text-3">
                        <FileUp className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-text">{COPY.emptyTitle[language]}</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-text-3">{COPY.emptyBody[language]}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="accent" onClick={onImport}>
                          <FileUp className="h-3.5 w-3.5" /> {COPY.importSheet[language]}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={onNew}>
                          <Plus className="h-3.5 w-3.5" /> {COPY.newActivity[language]}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto flex max-w-md items-start gap-3">
                      <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-text-4" />
                      <div>
                        <p className="text-sm font-semibold text-text">{COPY.noMatchTitle[language]}</p>
                        <p className="mt-1 text-[13px] text-text-3">{COPY.noMatchBody[language]}</p>
                        <button type="button" onClick={onClearFilters} className="mt-2 text-[13px] font-medium text-accent hover:underline">
                          {COPY.clear[language]}
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r, i) => {
                const flash = flashId === r.id;
                return (
                  <tr
                    key={r.id}
                    onClick={() => onOpen(r)}
                    className={cn(
                      "group/row cursor-pointer [&>td]:transition-colors hover:[&>td]:bg-surface-2",
                      flash && "[&>td]:animate-row-flash",
                      i < 24 && "animate-fade-in opacity-0"
                    )}
                    style={i < 24 ? { animationDelay: `${i * 14}ms` } : undefined}
                  >
                    <td className={cn(TD, "font-mono text-[12px] tabular-nums text-text-3")}>{fmtDate(r.activity_date, language)}</td>
                    <td className={cn(TD, "sticky left-0 z-[1] max-w-[280px] border-r border-r-divider bg-surface")}>
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-medium text-text" title={r.store_name}>
                          {r.store_name}
                        </span>
                      </span>
                    </td>
                    <td className={cn(TD, "font-mono text-[12px] tabular-nums text-text-2")}>{r.phone}</td>
                    {lists.map((f) => (
                      <td key={f.field} className={TD}>
                        <OptionChipSelect
                          label={`${f.label[language]}: ${r.store_name}`}
                          value={r[f.column]}
                          options={f.opts}
                          onChange={(id) => onChangeOption(r, f.column, id)}
                        />
                      </td>
                    ))}
                    <td className={cn(TD, "text-right font-mono text-[12px] tabular-nums text-text-2")}>{r.minutes ?? ""}</td>
                    <td className={cn(TD, "max-w-[360px] text-text-2")}>
                      <span className="block truncate" title={r.notes ?? ""}>
                        {r.notes}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
