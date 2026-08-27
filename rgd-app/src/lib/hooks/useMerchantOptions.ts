"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useMerchantOptions() {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("merchants")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setOptions((data ?? []).map((m: any) => ({ value: m.id, label: m.name })));
      });
    return () => {
      active = false;
    };
  }, []);

  return options;
}
