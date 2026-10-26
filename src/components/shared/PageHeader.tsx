/**
 * DESIGN.md › Page header: 23/600 title + one muted sub-line, actions right-aligned
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
          <h2 className="text-xl text-text sm:text-2xl">{title}</h2>
          {badge}
        </div>
        {description && <p className="mt-1 max-w-3xl text-[12.5px] text-text-3">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
