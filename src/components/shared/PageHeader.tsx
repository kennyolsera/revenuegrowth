/**
 * DESIGN.md › Page header: 22/600 title + one muted sub-line, actions right-aligned
 * (secondary first, exactly one primary last).
 */
export function PageHeader({
  title,
  description,
  action,
  badge,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-text">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1 max-w-[65ch] text-[13px] text-text-3">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
