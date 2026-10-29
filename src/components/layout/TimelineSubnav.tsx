"use client";

import { usePathname, useRouter } from "next/navigation";
import { House, Inbox, CircleCheck, FolderKanban, ListChecks, Calendar, ChartGantt, Users } from "lucide-react";
import { ptGo, usePtNav } from "@/lib/pt-bridge";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { route: "home", label: "Home", icon: House },
  { route: "mytasks", label: "My Tasks", icon: CircleCheck, count: "mytasks" as const },
  { route: "inbox", label: "Inbox", icon: Inbox, count: "inbox" as const },
  { route: "projects", label: "Projects", icon: FolderKanban },
  { route: "tasks", label: "Tasks", icon: ListChecks },
  { route: "calendar", label: "Calendar", icon: Calendar },
  { route: "timeline", label: "Timeline", icon: ChartGantt },
  { route: "members", label: "Members", icon: Users },
];

/** Project Timeline's own sections, shown under its menu item while it is open (ADR-012). */
export function TimelineSubnav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = usePtNav();
  const open = (route: string, id?: string) => {
    if (pathname !== "/kanban") router.push("/kanban");
    ptGo({ route, id });
    onNavigate?.();
  };
  const item = "flex h-[28px] w-full items-center gap-2 rounded-md pl-7 pr-2 text-left text-[13px] transition-colors";
  const on = "bg-rail-active font-medium text-rail-text shadow-[0_0_0_1px_rgb(var(--c-rail-line))]";
  const off = "text-rail-text-2 hover:bg-rail-hover hover:text-rail-text";

  return (
    <div className="mt-px space-y-px" aria-label="Project Timeline sections">
      {SECTIONS.map(({ route, label, icon: Icon, count }) => {
        const active = nav?.route === route;
        const n = count && nav ? nav.counts[count] : 0;
        return (
          <button key={route} type="button" onClick={() => open(route)} aria-current={active ? "page" : undefined} className={cn(item, active ? on : off)}>
            <Icon aria-hidden className={cn("h-[14px] w-[14px] shrink-0", active ? "text-rail-node" : "text-rail-muted")} strokeWidth={active ? 2.2 : 1.8} />
            <span className="truncate">{label}</span>
            {n > 0 && <span className="ml-auto font-mono text-[11px] tabular-nums text-rail-muted">{n}</span>}
          </button>
        );
      })}
      {nav && nav.projects.length > 0 && (
        <div className="pt-1.5">
          <div className="pb-0.5 pl-7 text-[11px] font-medium text-rail-muted">Projects</div>
          {nav.projects.map((p) => {
            const active = nav.route === "project" && nav.id === p.id;
            return (
              <button key={p.id} type="button" onClick={() => open("project", p.id)} aria-current={active ? "page" : undefined} className={cn(item, active ? on : off)} title={p.name}>
                <span aria-hidden className="h-2 w-2 shrink-0 rounded-[3px]" style={{ background: p.color }} />
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
