import { TimelineLoading } from "@/components/kanban/TimelineFrame";

// Shown the instant the menu is clicked, while the page itself loads.
export default function Loading() {
  return (
    <div className="relative h-full w-full">
      <TimelineLoading progress={5} />
    </div>
  );
}
