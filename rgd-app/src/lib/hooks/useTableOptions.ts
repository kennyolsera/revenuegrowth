"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useTableOptions(table: string, labelKey: string = "name") {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from(table)
      .select(`id, ${labelKey}`)
      .order(labelKey, { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setOptions((data ?? []).map((m: any) => ({ value: m.id, label: m[labelKey] })));
      });
    return () => {
      active = false;
    };
  }, [table, labelKey]);

  return options;
}
