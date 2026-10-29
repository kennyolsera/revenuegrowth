"use client";

/**
 * Bridge between the dashboard and the embedded Project Timeline app (ADR-012).
 * The template reports where it is (`nav`); the dashboard sidebar asks it to navigate (`ptGo`).
 */
import { useSyncExternalStore } from "react";

export interface PtProject {
  id: string;
  name: string;
  color: string;
}
export interface PtNav {
  route: string;
  id: string | null;
  projects: PtProject[];
  counts: { inbox: number; mytasks: number };
}

let nav: PtNav | null = null;
const listeners = new Set<() => void>();

export function setPtNav(next: PtNav) {
  nav = next;
  listeners.forEach((l) => l());
}

export function usePtNav() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => nav,
    () => null
  );
}

export const PT_GO_EVENT = "esmm:pt-go";
export type PtGo = { route: string; id?: string; tab?: string };

/** Ask Project Timeline to open a section (the host forwards it, queued until the app is ready). */
export function ptGo(detail: PtGo) {
  window.dispatchEvent(new CustomEvent<PtGo>(PT_GO_EVENT, { detail }));
}
