import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-surface-border bg-surface shadow-xs transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-border px-5 py-3.5">
      <div className="flex items-start gap-2.5">
        {Icon && (
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
