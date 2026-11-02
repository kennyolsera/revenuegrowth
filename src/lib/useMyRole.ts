"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

let cached: Promise<string | null> | null = null;

/** The signed-in user's profile role (read once per page load). UI hint only; the database enforces the rules. */
export function useMyRole() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    cached ||= (async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle<{ role: string | null }>();
      return data?.role ?? null;
    })().catch(() => {
      cached = null;
      return null;
    });
    cached.then((r) => alive && setRole(r));
    return () => {
      alive = false;
    };
  }, []);
  return role;
}

export const isSuperAdmin = (role: string | null) => role === "super_admin";
