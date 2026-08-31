import { cn } from "@/lib/utils";
import { EmptyState } from "./SupabaseNotice";
import { useLanguage } from "@/lib/LanguageContext";

export interface ColumnDef<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  actions,
  emptyText,
  onRowClick,
}: {
  columns: ColumnDef<T>[];
  rows: T[];
  actions?: (row: T) => React.ReactNode;
  emptyText?: string;
  onRowClick?: (row: T) => void;
}) {
  const { t } = useLanguage();
  const resolvedEmptyText = emptyText ?? t("no_data");

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-card">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-canvas">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "label-mono whitespace-nowrap px-4 py-3 text-ink-muted",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="label-mono px-4 py-3 text-right text-ink-muted">{t("actions")}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12">
                  <EmptyState text={resolvedEmptyText} />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "group bg-surface transition-colors hover:bg-accent-soft/50",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap px-4 py-2.5 text-[13px] text-ink-body",
                        col.align === "right" && "text-right font-mono",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="whitespace-nowrap px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
