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
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t("actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12">
                  <EmptyState text={resolvedEmptyText} />
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "group transition-colors duration-150",
                    idx % 2 === 1 ? "bg-slate-50/40" : "bg-white",
                    "hover:bg-blue-50/50",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap px-4 py-3 text-sm text-slate-700 font-medium",
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
