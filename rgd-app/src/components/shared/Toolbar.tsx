"use client";

import { Search, Filter } from "lucide-react";
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
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={defaultPlaceholder}
            className="pl-10 h-10 rounded-xl bg-white shadow-xs"
          />
        </div>

        {/* Dropdown Filters */}
        {filters?.map((f) => (
          <div key={f.key} className="w-full sm:w-auto">
            <Select
              value={filterValues?.[f.key] ?? ""}
              onChange={(e) => onFilterChange?.(f.key, e.target.value)}
              className="h-10 sm:w-48 text-xs font-medium"
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

      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
