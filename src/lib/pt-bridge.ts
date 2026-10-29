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
export interface PtNotif {
  id: string;
  type: "mention" | "assign" | "comment" | string;
  by: string;
  text: string;
  title: string;
  snippet: string;
  at: number;
  read: boolean;
}
export interface PtSettings {
  wsName: string;
  prefs: {
    weekStart: string;
    dateFmt: string;
    timeFmt: string;
    home: string;
    openTasks: string;
    confirmDel: boolean;
    showDoneBoard: boolean;
  };
  notif: { mention: boolean; assign: boolean; comment: boolean };
}
export interface PtNav {
  route: string;
  id: string | null;
  projects: PtProject[];
  counts: { inbox: number; mytasks: number };
  unread: number;
  notifs: PtNotif[];
  settings: PtSettings;
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

export const PT_CMD_EVENT = "esmm:pt-cmd";
export type PtCmd = { type: string; [k: string]: unknown };
export type PtGo = { route: string; id?: string; tab?: string };

/** Send a command to Project Timeline (the host forwards it, queued until the app is ready). */
export function ptSend(cmd: PtCmd) {
  window.dispatchEvent(new CustomEvent<PtCmd>(PT_CMD_EVENT, { detail: cmd }));
}

/** Ask Project Timeline to open a section. */
export function ptGo(detail: PtGo) {
  ptSend({ type: "go", ...detail });
}
