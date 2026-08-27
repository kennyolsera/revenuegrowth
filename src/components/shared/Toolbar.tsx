"use client";

import { Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import { useLanguage } from "@/lib/LanguageContext";

export interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export function Toolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  filterValues,
  onFilterChange,
  right,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  right?: React.ReactNode;
}) {
  const { t, language } = useLanguage();
  const defaultPlaceholder = searchPlaceholder ?? t("search");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search with clear button */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={defaultPlaceholder}
            className="pl-10 pr-8 h-10 rounded-xl bg-white shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns — scroll horizontally on mobile */}
        {filters && filters.length > 0 && (
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {filters.map((f) => (
              <div key={f.key} className="shrink-0">
                <Select
                  value={filterValues?.[f.key] ?? ""}
                  onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                  className="h-10 w-40 text-xs font-medium sm:w-48"
                >
                  <option value="">
                    {f.label}: {language === "id" ? "Semua" : "All"}
                  </option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>

      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
